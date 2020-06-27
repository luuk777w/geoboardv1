using Microsoft.EntityFrameworkCore.Migrations;

namespace GeoBoard.Migrations
{
    public partial class init7 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "number",
                table: "Note");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "number",
                table: "Note",
                nullable: false,
                defaultValue: 0);
        }
    }
}
