using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace GeoBoard.Migrations
{
    public partial class Init2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Image_Board_BoardID",
                table: "Image");

            migrationBuilder.DropForeignKey(
                name: "FK_Note_Board_BoardID",
                table: "Note");

            migrationBuilder.RenameColumn(
                name: "memberName",
                table: "Note",
                newName: "userName");

            migrationBuilder.RenameColumn(
                name: "memberName",
                table: "Image",
                newName: "userName");

            migrationBuilder.AlterColumn<Guid>(
                name: "BoardID",
                table: "Note",
                nullable: false,
                oldClrType: typeof(Guid),
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "BoardID",
                table: "Image",
                nullable: false,
                oldClrType: typeof(Guid),
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Image_Board_BoardID",
                table: "Image",
                column: "BoardID",
                principalTable: "Board",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Note_Board_BoardID",
                table: "Note",
                column: "BoardID",
                principalTable: "Board",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Image_Board_BoardID",
                table: "Image");

            migrationBuilder.DropForeignKey(
                name: "FK_Note_Board_BoardID",
                table: "Note");

            migrationBuilder.RenameColumn(
                name: "userName",
                table: "Note",
                newName: "memberName");

            migrationBuilder.RenameColumn(
                name: "userName",
                table: "Image",
                newName: "memberName");

            migrationBuilder.AlterColumn<Guid>(
                name: "BoardID",
                table: "Note",
                nullable: true,
                oldClrType: typeof(Guid));

            migrationBuilder.AlterColumn<Guid>(
                name: "BoardID",
                table: "Image",
                nullable: true,
                oldClrType: typeof(Guid));

            migrationBuilder.AddForeignKey(
                name: "FK_Image_Board_BoardID",
                table: "Image",
                column: "BoardID",
                principalTable: "Board",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Note_Board_BoardID",
                table: "Note",
                column: "BoardID",
                principalTable: "Board",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
