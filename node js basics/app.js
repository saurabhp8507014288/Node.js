
const http = require('http');
const fs = require('fs');
const url = require('url');
let replaceHtml = require('./Modules/replaceHtml'); // user defined
const events = require('events');
const user = require('./Modules/user');


const html  = fs.readFileSync('./Templates/index.html', 'utf8');
let products = JSON.parse(fs.readFileSync('./Data/products.json', 'utf-8'))
let productListHtml = fs.readFileSync('./Templates/product-list.html', 'utf8'); 
let productDetailHtml = fs.readFileSync('./Templates/product-details.html', 'utf8');

const server = http.createServer();

// server.on('request', (request, response)=>{
//     let {query, pathname:path} = url.parse(request.url, true);
    
//     if(path === '/' || path.toLocaleLowerCase() === '/home'){
//         response.writeHead(200, { 
//             'Content-Type': 'text/html',
//             'my-header': 'Hello, world'
//         });
//         response.end(html.replace('{{%CONTENT%}}', "You are in home page"));
//     }

//     else if(path.toLocaleLowerCase() === '/about'){
//         response.writeHead(200,  { 
//             'Content-Type': 'text/html',
//             'my-header': 'Hello, world'
//         });
//         response.end(html.replace('{{%CONTENT%}}', "You are in about page"));
//     }

//     else if(path.toLocaleLowerCase() === '/contact'){
//         response.writeHead(200,  { 
//             'Content-Type': 'text/html',
//             'my-header': 'Hello, world'
//         });
//         response.end(html.replace('{{%CONTENT%}}', "You are in contact page"));
//     }

//     else if(path.toLocaleLowerCase() === '/products'){
//         if(!query.id){
//             let productHtmlArray = products.map((prod)=>{
//                 return replaceHtml(productListHtml, prod);
//             })
//             let productResponseHtml = html.replace('{{%CONTENT%}}', productHtmlArray.join(','));
//             response.writeHead(200,  { 
//                 'Content-Type': 'text/html'
//             });
//             response.end(productResponseHtml);
//         }
//         else{
//             let prod = products[query.id];
//             let productDetailResponseHtml = replaceHtml(productDetailHtml, prod);
//             response.end(html.replace('{{%CONTENT%}}', productDetailResponseHtml));
//         }
        
//     }

//     else{
//         response.writeHead(404,  { 
//             'Content-Type': 'text/html',
//             'my-header': 'Hello, world'
//         });
//         response.end(html.replace('{{%CONTENT%}}', "Error 404: Page not found"));
//     }
// })


server.listen(8000, '127.0.0.1', ()=>{
    console.log("Server has started");
})


// let myEmitter = new user();

// myEmitter.on("userCreated", (id, name)=>{
//     console.log(`A new user ${name} with id ${id} is created`);
// })

// myEmitter.on("userCreated", (id, name)=>{
//     console.log(`A new user ${name} with id ${id} is added in DB`);
// })

// myEmitter.emit("userCreated", 1901, 'john');



// server.on('request', (req, res)=>{
//     let rs = fs.createReadStream('./Files/large-file.txt'); // read data in pieces

//     rs.on('data', (chunk)=>{
//         res.write(chunk);
//     })

//     rs.on('end', ()=>{
//         res.end(); 
//     })

//     rs.on('end', ()=>{
//         res.end();
//     })

//     rs.on('error', (err)=>{
//         res.end(err.message);
//     })
// });

server.on('request', (req, res)=>{
    let rs = fs.createReadStream('./Files/large-file.txt');
    rs.pipe(res); //take writable stream: writable stream, duplex stream, transform stream
})