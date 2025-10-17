const expess = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const chatRoutes = require('./routes/chat.route');
const app = expess();

app.use(expess.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

module.exports = app;