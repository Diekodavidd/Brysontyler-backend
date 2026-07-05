const layout=require("./layout");

module.exports=(user)=>layout(

"Congratulations!",

`

<p>

Hi ${user.name},

</p>

<p>

Your Creator Application has been approved.

</p>

<p>

You can now upload premium content and begin earning.

</p>

<div style="margin-top:35px">

<a
href="${process.env.FRONTEND_URL}/creator"
style="
background:#d4af37;
padding:15px 28px;
text-decoration:none;
color:black;
border-radius:10px;
font-weight:bold;
"
>

Go To Dashboard

</a>

</div>

`

);