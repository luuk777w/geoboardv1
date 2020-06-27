using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GeoBoard.Models
{
    public class Board
    {
        public Guid ID { get; set; }

        public string SessionId { get; set; }

        public ICollection<Image> Images { get; set;}

        public ICollection<Note> Notes { get; set; }
    }
}
