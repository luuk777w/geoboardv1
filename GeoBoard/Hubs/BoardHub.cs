using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Primitives;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GeoBoard.Models;
using System.IO;

namespace GeoBoard.Hubs
{
    public class BoardHub : Hub
    {
        private readonly GeoBoardContext _context;

        public BoardHub(GeoBoardContext context)
        {
            _context = context;
        }

        public override Task OnConnectedAsync()
        {
            var sessionId = Context.GetHttpContext().Request.Query["sessionId"];

            if(_context.Board.Where(x => x.SessionId == sessionId).Count() == 0)
            {
                _context.Board.Add(new Board
                {
                    SessionId = sessionId
                });

                _context.SaveChanges();
            }

            return Groups.AddToGroupAsync(Context.ConnectionId, sessionId);
        }

        public async Task SendNote(string sessionId, string noteId, string username, string noteBody, string dateTime)
        {
            var boardID = _context.Board.Where(x => x.SessionId == sessionId).FirstOrDefault().ID;
            var note = _context.Note.Where(x => x.BoardID == boardID);

            if (note.Where(x => x.ID == Guid.Parse(noteId)).Count() > 0)
            {
                note.Where(x => x.ID == Guid.Parse(noteId)).FirstOrDefault().noteText = noteBody;
            } 
            else
            {
                _context.Note.Add(new Note
                {
                    ID = Guid.Parse(noteId),
                    userName = username,
                    noteText = noteBody,
                    dateTime = dateTime,
                    BoardID = boardID
                });
            }

            await _context.SaveChangesAsync();

            await Clients.Group(sessionId).SendAsync("ReceiveNote", noteId, username, noteBody, dateTime);


        }

        public async Task Remove(string sessionId, string itemId, string username)
        {
            if(_context.Note.Where(x => x.ID == Guid.Parse(itemId)).Any())
            {
                _context.Note.Remove(_context.Note.First(x => x.ID == Guid.Parse(itemId)));

            } 
            else if (_context.Image.Where(x => x.ID == Guid.Parse(itemId)).Any())
            {
                _context.Image.Remove(_context.Image.First(x => x.ID == Guid.Parse(itemId)));
            }

            await _context.SaveChangesAsync();

            await Clients.Group(sessionId).SendAsync("Remove", itemId, username);
        }

        public async Task ClearAll(string sessionId, string username)
        {
            var boardID = _context.Board.Where(x => x.SessionId == sessionId).FirstOrDefault().ID;

            _context.Note.RemoveRange(_context.Note.Where(x => x.BoardID == boardID));
            _context.Image.RemoveRange(_context.Image.Where(x => x.BoardID == boardID));

            await _context.SaveChangesAsync();

            await Clients.Group(sessionId).SendAsync("ClearAll", username);
        }
    }
}
