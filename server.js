const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");
const bodyParse = require("body-parser");
const dotenv = require("dotenv");

//Setup
const app = express();
const url = "https://lienquan.garena.vn/tuong";
const urlChitiet = "https://lienquan.garena.vn/tuong-chi-tiet/";

dotenv.config();
app.use(cors());
app.use(bodyParse.json({ limit: "50mb" }));
bodyParse.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
});

console.log("Server is running....");

//Routes
app.get("/tuong", (req, resp) => {
    try {
        const tuongs = [];
        axios(url).then((res) => {
            const html = res.data;
            const $ = cheerio.load(html);
            $(".list-champion", html).each(function () {
                const name = $(this).find(".heroes > .name").attr("data-name");
                const id = $(this).find(".heroes > .name").attr("data-id");
                const img = $(this).find(".heroes > a > img").attr("src");
                const url = "https://lien-quan-api.onrender.com/chi-tiet-tuong/" + id;
                tuongs.push({
                    name,
                    id,
                    img: "https://lienquan.garena.vn" + img,
                    url,
                });
            });
            resp.status(200).json(tuongs);
        });
    } catch (error) {
        resp.status(500).json(error);
    }
});

app.get("/chi-tiet-tuong/:id", (req, resp) => {
    try {
        const urlChitietTuong = urlChitiet + req.params.id;
        let thongTinTuong = {};
        axios(urlChitietTuong).then((res) => {
            const html = res.data;
            const $ = cheerio.load(html);
            $(".heroes-page > .inner-page", html).each(function () {
                const name = $(this).find(".skin-hero .title").text();
                const tieuSu = $(this).find(".cont-skill #tab-2 p").text();
                const skin = [];
                $(this)
                    .find(".bxskin .tabs-content-skin")
                    .each(function () {
                        skin.push(
                            "https://lienquan.garena.vn" +
                                $(this)
                                    .find(".tabs-content-skin > img")
                                    .attr("src")
                        );
                    });
                let skill = [];
                $(this)
                    .find(".bxskill .cont-skill #tab-1 .col-skill .item-skill")
                    .each(function () {
                        const imgSkill = $(this)
                            .find(".img-skill > img")
                            .attr("src");
                        const nameSkill = $(this)
                            .find(".in-skill .name")
                            .text();
                        const countDown = $(this).find(".in-skill .txt").text();
                        const videoSkill = $(this)
                            .find(".in-skill a")
                            .attr("href");
                        skill.push({
                            nameSkill,
                            imgSkill: "https://lienquan.garena.vn" + imgSkill,
                            countDown,
                            videoSkill,
                        });
                    });
                thongTinTuong = {
                    name,
                    tieuSu,
                    skin,
                    skill,
                };
            });
            resp.status(200).json(thongTinTuong);
        });
    } catch (error) {
        resp.status(500).json(error);
    }
});

//Run port
app.listen(8000);
