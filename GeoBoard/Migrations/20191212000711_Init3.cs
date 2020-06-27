using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace GeoBoard.Migrations
{
    public partial class Init3 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "timeStamp",
                table: "Note");

            migrationBuilder.DropColumn(
                name: "timeStamp",
                table: "Image");

            migrationBuilder.AddColumn<string>(
                name: "dateTime",
                table: "Note",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "dateTime",
                table: "Image",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "dateTime",
                table: "Note");

            migrationBuilder.DropColumn(
                name: "dateTime",
                table: "Image");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "timeStamp",
                table: "Note",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "timeStamp",
                table: "Image",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));
        }
    }
}
