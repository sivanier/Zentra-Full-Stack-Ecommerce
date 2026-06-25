import 'dotenv/config'; import express from 'express'; import cors from 'cors'; import { connectDB, isMongoConnected } from './config/db.js'; import authRoutes from './routes/auth.js'; import productRoutes from './routes/products.js'; import cartRoutes from './routes/cart.js'; import orderRoutes from './routes/orders.js';
const app=express(); app.use(cors({origin:process.env.CLIENT_URL?.split(',')||'*'})); app.use(express.json());
app.get('/api/health',(req,res)=>res.json({status:'ok',app:'Zentra API',database:isMongoConnected()?'mongodb':'json-fallback'})); app.use('/api/auth',authRoutes); app.use('/api/products',productRoutes); app.use('/api/cart',cartRoutes); app.use('/api/orders',orderRoutes);
app.use((err,req,res,next)=>{console.error(err);res.status(500).json({message:err.message||'Something went wrong.'})});
connectDB().then(()=>app.listen(process.env.PORT||5000,()=>console.log(`Zentra API running on ${process.env.PORT||5000}`)));
