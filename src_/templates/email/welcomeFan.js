const layout = require("./layout");

module.exports = (user)=>layout(

"Welcome to Bryson Tyler",

`

<p>

Hi <strong>${user.name}</strong>,

</p>

<p>

Welcome to Bryson Tyler.

Your account has been created successfully.

</p>

<p>

Start exploring exclusive content from your favourite creators.

</p>

<div style="margin-top:40px">

<a
href="${process.env.FRONTEND_URL}/gallery"
style="
background:#d4af37;
padding:16px 30px;
border-radius:12px;
text-decoration:none;
color:black;
font-weight:bold;
"
>

Explore Gallery

</a>

</div>

`

);