using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace GeoBoard.Models
{
    public class GeoBoardContext : DbContext
    {
        public GeoBoardContext (DbContextOptions<GeoBoardContext> options)
            : base(options)
        {
        }

        public DbSet<Board> Board { get; set; }
        public DbSet<Image> Image { get; set; }
        public DbSet<Note> Note { get; set; }


    }
}
