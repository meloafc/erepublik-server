// rascunho

battlesActive = function() {
    request({
      url: EREPUBLIK_DEUTSCHLAND_API + '/battles/active',
      json: true
    }, function (error, response, body) {
    
      if (!error && response.statusCode === 200) {
        for (const i in body.active) {
          // console.log(i + ' = ' + body.active[i].general.type + ' | ' + body.active[i].region.name);
          region = 'Dublin';
          if (body.active[i].region.name === region) {
            console.log(body.active[i]);
          }
        }
        // console.log(body.active) // Print the json response
      }
    
    })
  }