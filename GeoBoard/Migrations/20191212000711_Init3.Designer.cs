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
    [Migration("20191212000711_Init3")]
    partial class Init3
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "2.1.14-servicing-32113")
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

                    b.Property<Guid>("BoardID");

                    b.Property<string>("dateTime");

                    b.Property<string>("path");

                    b.Property<string>("userName");

                    b.HasKey("ID");

                    b.HasIndex("BoardID");

                    b.ToTable("Image");
                });

            modelBuilder.Entity("GeoBoard.Models.Note", b =>
                {
                    b.Property<Guid>("ID")
                        .ValueGeneratedOnAdd();

                    b.Property<Guid>("BoardID");

                    b.Property<string>("dateTime");

                    b.Property<string>("noteText");

                    b.Property<string>("userName");

                    b.HasKey("ID");

                    b.HasIndex("BoardID");

                    b.ToTable("Note");
                });

            modelBuilder.Entity("GeoBoard.Models.Image", b =>
                {
                    b.HasOne("GeoBoard.Models.Board", "Board")
                        .WithMany("Images")
                        .HasForeignKey("BoardID")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("GeoBoard.Models.Note", b =>
                {
                    b.HasOne("GeoBoard.Models.Board", "Board")
                        .WithMany("Notes")
                        .HasForeignKey("BoardID")
                        .OnDelete(DeleteBehavior.Cascade);
                });
#pragma warning restore 612, 618
        }
    }
}
