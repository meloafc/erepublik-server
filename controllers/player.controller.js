/*

app.get('/player/:id', function (req, res, next) {
    let id = req.params.id;

    let url = 'https://www.erepublik.com/br/citizen/profile/' + id;
    request(url, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            const $ = cheerio.load(body);

            $('img.citizen_avatar').each(function (i, element) {
                const name = $(this).attr('alt');

                $('#achievment').find('li').each(function (i, element) {
                    let medal = $(this).children('img').attr('alt');
                    if (medal === 'resistance hero') {
                        let resistanceHero = $(this).children('.counter').text();
                        if (!resistanceHero) {
                            resistanceHero = 0;
                        }
                        return res.json({
                            "name": name,
                            "resistance_hero": resistanceHero
                        });
                    }
                });

            });

        } else {
            return res.json({});
        }
    });
});
/*