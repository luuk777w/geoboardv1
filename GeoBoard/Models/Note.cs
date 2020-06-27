using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GeoBoard.Models
{
    public class Note
    {
        public Guid ID { get; set; }

        public string userName { get; set; }

        public string noteText { get; set; }

        public string dateTime { get; set; }

        public Guid BoardID { get; set; }
    }
}
