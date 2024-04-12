import fetch from 'node-fetch';

let finalResult=[]
let baseUrl=`https://www.swapi.tech/api/people/?name=`;

let arr=['skywalker', 'Padmé Amidala', 'r2'];

let fetchedUrl = arr.map(name => {
    let encodedName = encodeURIComponent(name);
    return fetch(`${baseUrl}${encodedName}`);
});

// fetch('https://www.swapi.tech/api/people/?name=skywalker')
//     .then(res=> res.json())
//     .then(data=> console.log(data.result))



(async ()=>{
    let arrOfPromises = await Promise.allSettled(fetchedUrl);
    //console.log(results);
    for (let elem of arrOfPromises) {
        if (elem.status === 'fulfilled') {
            let res = await elem.value.json();
            finalResult.push(res.result);
            //console.log(res.result[0].properties); // Выведет результаты каждого fetch запроса
        } else {
            console.error('Ошибка:', elem.reason);
        }
    }

    console.log(finalResult);

})();

//
//
// (async ()=>{
//
//
//     let prom1= await fetch(baseUrl);
//     let response1 = await prom1.json();
//     for (let person of response1.result){
//         // finalResult.push(person.properties.name)
//         finalResult.push({ name: person.properties.name, height: person.properties.height} )
//     }
//     // console.log(response1.result);
//     console.log(finalResult);
//
// })();