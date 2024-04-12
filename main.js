import fetch from 'node-fetch';

let url=new URL('https://www.swapi.tech/api/people/?name=r2');
    (async ()=>{


            let prom1= await fetch(url);
            let response1 = await prom1.json();
            console.log(response1.result)

    })();

// // fetch("https://www.swapi.tech/api/people")
// //     .then(res => res.json())
// //     .then(data => console.log(data))
//     .catch(err => console.error(err))