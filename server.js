const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body').default;
const uuid = require('uuid');


const app = new Koa();

app.use(koaBody({
  urlencoded: true,
  multipart: true,
}));


let tickets = [
  {
    id: '123-456-789',
    name: 'Test ticket with description',
    description: 'This is a test ticket description',
    status: true,
    created: new Date().toLocaleString(),
  },
  {
    id: '987-654-321',
    name: 'Test ticket without description',
    description: '',
    status: false,
    created: new Date().toLocaleString(),
  },
];


app.use((ctx, next) => {
  if(ctx.request.method !== 'OPTIONS') {
    next();

    return;
  }

  ctx.response.set('Access-Control-Allow-Origin', '*');

  ctx.response.set('Access-Control-Allow-Methods', 'DELETE, PUT, PATCH, GET, POST');

  ctx.response.status = 204;

  next();
})


app.use(async (ctx, next) => {
  const { method} = ctx.request.query;
  console.log(ctx.request.querystring)
  console.log(method)

  switch (method) {
    case 'allTickets':
      ctx.response.set('Access-Control-Allow-Origin', '*');
      ctx.response.body = tickets;
      return;
    case 'createTicket':
      const {name, description} =  ctx.request.body;



      ctx.response.set('Access-Control-Allow-Origin', '*');

      if(tickets.some(sub => sub.name === name)) {
        ctx.response.status = 400;
        ctx.response.body = 'tickets exists';
        return;
      }

      const generateId = uuid.v4();

      const ticket = {
        id: generateId,
        name: name,
        description: description,
        status: false,
        created: new Date().toLocaleString(),
      }

      tickets.push(ticket);

      ctx.response.body = 'ОК';
      return;
    case 'deleteTicket':
      const { id } = ctx.request.query;
      console.log(ctx.request.query)

      ctx.response.set('Access-Control-Allow-Origin', '*');

      tickets = tickets.filter(sub => sub.id !== id);

      ctx.response.body = 'OK';
      return;
    default:
      ctx.response.status = 404;
      return;
  }
  next();
});



app.use((ctx, next) => {

  if(ctx.request.method !== 'PATCH') {
    next();

    return;
  }
  const { method, id } = ctx.request.query;


  console.log(method)

  if(method === 'replaceTicket') {
    ctx.response.set('Access-Control-Allow-Origin', '*');


    const
      {
        name,
        description,
      } = ctx.request.body;

    const editingTicket = tickets.find((ticket) => ticket.id === id);
    console.log(editingTicket)
    if (!editingTicket) return;
    editingTicket.name = name;
    editingTicket.description = description;

    ctx.response.body = 'OK';
    next();
  }

  if(method === 'replaceStatus') {

    ctx.response.set('Access-Control-Allow-Origin', '*');

    const
      {
        status
      } = ctx.request.body;
    console.log( id, status);

    const editingTicket = tickets.find((ticket) => ticket.id === id);
    if (!editingTicket) return;
    editingTicket.status = status;

    ctx.response.body = 'OK';
    next();
  }
})



const server = http.createServer(app.callback());

const port = process.env.PORT || 8080;


server.listen(port, (err) => {
  if (err) {
    console.log(err);

    return;
  }

  console.log('Server is listening to ' + port);
});
