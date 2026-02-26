 "use client";
 import "./credit-menu.css";
 
 import Nav from "@/components/Nav/Nav";
 import ConditionalFooter from "@/components/ConditionalFooter/ConditionalFooter";
 import Copy from "@/components/Copy/Copy";
 
 const page = () => {
   return (
     <>
       <Nav />
       <div className="page credit-menu-page">
         <section className="credit-hero">
           <div className="container">
             <div className="credit-hero-header">
               <Copy delay={0.85}>
                 <h1>Credit menu</h1>
               </Copy>
               <Copy delay={1.1}>
                 <p className="subtitle">Universal Tori wallet</p>
               </Copy>
             </div>
           </div>
         </section>
         <section className="credit-content">
           <div className="container">
             <div className="menu-grid">
               <div className="menu-card gym">
                 <div className="menu-card-header">
                   <h3>Gym</h3>
                   <span className="price">₹130</span>
                 </div>
               </div>
               <div className="menu-card zumba">
                 <div className="menu-card-header">
                   <h3>Zumba</h3>
                   <span className="price">₹70</span>
                 </div>
               </div>
               <div className="menu-card yoga">
                 <div className="menu-card-header">
                   <h3>Yoga</h3>
                   <span className="price">₹70</span>
                 </div>
               </div>
             </div>
             <div className="menu-table">
               <table>
                 <thead>
                   <tr>
                     <th>Service</th>
                     <th>Price</th>
                     <th>Notes</th>
                   </tr>
                 </thead>
                 <tbody>
                   <tr>
                     <td>Gym</td>
                     <td>₹130</td>
                     <td>per session</td>
                   </tr>
                   <tr>
                     <td>Zumba</td>
                     <td>₹70</td>
                     <td>per session</td>
                   </tr>
                   <tr>
                     <td>Yoga</td>
                     <td>₹70</td>
                     <td>per session</td>
                   </tr>
                    <tr>
                     <td>Strength workout</td>
                     <td>₹70</td>
                     <td>per session</td>
                   </tr>

                 </tbody>
               </table>
             </div>
           </div>
         </section>
       </div>
       <ConditionalFooter />
     </>
   );
 };
 
 export default page;
