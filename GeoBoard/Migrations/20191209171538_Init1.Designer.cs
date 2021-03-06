﻿// <auto-generated />
using System;
using GeoBoard.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace GeoBoard.Migrations
{
    [DbContext(typeof(GeoBoardContext))]
    [Migration("20191209171538_Init1")]
    partial class Init1
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "2.1.11-servicing-32099")
                .HasAnnotation("Relational:MaxIdentifierLength", 128)
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("GeoBoard.Models.Board", b =>
                {
                    b.Property<Guid>("ID")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("SessionId");

                    b.HasKey("ID");

                    b.ToTable("Board");
                });

            modelBuilder.Entity("GeoBoard.Models.Image", b =>
                {
                    b.Property<Guid>("ID")
                        .ValueGeneratedOnAdd();

                    b.Property<Guid?>("BoardID");

                    b.Property<string>("memberName");

                    b.Property<string>("path");

                    b.Property<DateTimeOffset>("timeStamp");

                    b.HasKey("ID");

                    b.HasIndex("BoardID");

                    b.ToTable("Image");
                });

            modelBuilder.Entity("GeoBoard.Models.Note", b =>
                {
                    b.Property<Guid>("ID")
                        .ValueGeneratedOnAdd();

                    b.Property<Guid?>("BoardID");

                    b.Property<string>("memberName");

                    b.Property<string>("noteText");

                    b.Property<DateTimeOffset>("timeStamp");

                    b.HasKey("ID");

                    b.HasIndex("BoardID");

                    b.ToTable("Note");
                });

            modelBuilder.Entity("GeoBoard.Models.Image", b =>
                {
                    b.HasOne("GeoBoard.Models.Board", "Board")
                        .WithMany("Images")
                        .HasForeignKey("BoardID");
                });

            modelBuilder.Entity("GeoBoard.Models.Note", b =>
                {
                    b.HasOne("GeoBoard.Models.Board", "Board")
                        .WithMany("Notes")
                        .HasForeignKey("BoardID");
                });
#pragma warning restore 612, 618
        }
    }
}
