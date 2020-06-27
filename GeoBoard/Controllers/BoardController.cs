using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using GeoBoard.Models;
using Microsoft.Extensions.Configuration;
using GeoBoard.Hubs;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;
using Microsoft.EntityFrameworkCore;

namespace GeoBoard.Controllers
{
    [Route("api/board")]
    [ApiController]
    public class BoardController : ControllerBase
    {
        private readonly GeoBoardContext _context;
        private readonly IHubContext<BoardHub> _hubContext;
        public IConfiguration Configuration { get; }

        public BoardController(GeoBoardContext context, IConfiguration configuration, IHubContext<BoardHub> hubContext)
        {
            _context = context;
            Configuration = configuration;
            _hubContext = hubContext;
        }

        [HttpPost]
        [IgnoreAntiforgeryToken]
        public async Task<IActionResult> UploadImage([FromBody] ImageModel imageModel)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var dateTime = DateTime.Now;
            var dateTimeStringMili = dateTime.ToString("dd-MM-yyyyTHH.mm.ss.fff");
            var dateTimeString = dateTime.ToString("dd-MM-yyyy HH:mm:ss");

            string filePath = Configuration.GetSection("ImageStoragePath").Value + "/" + dateTimeStringMili + ".jpg";
            System.IO.File.WriteAllBytes(filePath, Convert.FromBase64String(imageModel.blob));

            var boardID = _context.Board.Where(x => x.SessionId == imageModel.sessionId).FirstOrDefault().ID;

            var number = 1;

            if(_context.Image.Where(x => x.BoardID == boardID).Count() > 0)
            {
                number = _context.Image.Where(x => x.BoardID == boardID).OrderBy(x => x.number).Last().number + 1;
            }

            _context.Image.Add(new Image
            {
                ID = Guid.Parse(imageModel.imageId),
                userName = imageModel.userName,
                path= "/images/userImages/" + dateTimeStringMili + ".jpg",
                dateTime = dateTimeString,
                number = number,
                BoardID = boardID
            });

            await _context.SaveChangesAsync();

            await _hubContext.Clients.Group(imageModel.sessionId).SendAsync("ReceiveImage", imageModel.userName, "/images/userImages/" + dateTimeStringMili + ".jpg", dateTimeString, imageModel.imageId, number);

            return Ok();
        }

        [HttpPost("{sessionId}")]
        [ActionName("load")]
        public async Task<IActionResult> LoadBoard([FromQuery] string sessionId)
        {
            var board = _context.Board.Include(x => x.Images).Include(x => x.Notes).First(x => x.SessionId == sessionId);

            return Ok(JsonConvert.SerializeObject(board));
        }
    }
}
