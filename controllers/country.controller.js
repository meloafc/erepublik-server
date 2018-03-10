//rascunho

countries = function() {
    request({
      url: EREPUBLIK_DEUTSCHLAND_API + '/countries/details/all',
      json: true
    }, function (error, response, body) {
      let countryCounter = 0;
      let regionCounter = 0;
    
      if (!error && response.statusCode === 200) {
        for (const countryId in body.countries) {
          countryCounter += 1;
          console.log(body.countries[countryId].country_name);
  
          for (const regionId in body.countries[countryId].regions.lists.original) {
            regionCounter += 1;
            console.log('-' + body.countries[countryId].regions.lists.original[regionId].region_name);
          }
        }
  
        console.log('countryCounter ' + countryCounter);
        console.log('regionCounter ' + regionCounter);
      }
    
    })
  }