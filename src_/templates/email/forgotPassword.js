const layout=require("./layout");

module.exports=(link)=>layout(

"Reset Your Password",

`

<p>

Someone requested a password reset.

</p>

<p>

If this was you, click below.

</p>

<div style="margin-top:35px">

<a
href="${link}"
style="
background:#d4af37;
padding:15px 28px;
border-radius:10px;
color:black;
font-weight:bold;
text-decoration:none;
"
>

Reset Password

</a>

</div>

<p style="margin-top:30px">

This link expires in 15 minutes.

</p>

`

);