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
  const { method, id} = ctx.request.query;
  const
    {
      status,
      name,
      description,
    } = ctx.request.body;

  const editingTicket = tickets.find((ticket) => ticket.id === id);

  switch (method) {
    case 'allTickets':
      ctx.response.set('Access-Control-Allow-Origin', '*');
      ctx.response.body = tickets;
      return;
    case 'createTicket':

      console.log(ctx.request.body);

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

      ctx.response.body = 'OK';
      return;
    case 'deleteTicket':

      console.log(ctx.request.query)

      ctx.response.set('Access-Control-Allow-Origin', '*');

      tickets = tickets.filter(sub => sub.id !== id);

      ctx.response.body = 'OK';
      return;
    case 'replaceStatus':

        ctx.response.set('Access-Control-Allow-Origin', '*');


        if (!editingTicket) return;
        editingTicket.status = status;

        ctx.response.body = 'OK';
      return;
    case 'replaceTicket':
      ctx.response.set('Access-Control-Allow-Origin', '*');


    if (!editingTicket) return;
    editingTicket.name = name;
    editingTicket.description = description;

    ctx.response.body = 'OK';
      return;
    default:
      ctx.response.status = 404;
      return;
  }
  next();
});

const server = http.createServer(app.callback());

const port = process.env.PORT || 8080;

server.listen(port, (err) => {
  if (err) {
    console.log(err);

    return;
  }

  console.log('Server is listening to ' + port);
});

