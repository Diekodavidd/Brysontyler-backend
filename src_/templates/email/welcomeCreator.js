const layout=require("./layout");

module.exports=(user)=>layout(

"Welcome Creator",

`

<p>

Hi ${user.name},

</p>

<p>

Congratulations on becoming a Bryson Tyler Creator.

</p>

<h3>

Next Steps

</h3>

<ul>

<li>Complete Profile</li>

<li>Upload Profile Photo</li>

<li>Submit Verification</li>

<li>Wait for Approval</li>

</ul>

<div style="margin-top:40px">

<a
href="${process.env.FRONTEND_URL}/creator"
style="
background:#d4af37;
padding:15px 30px;
color:black;
border-radius:10px;
text-decoration:none;
font-weight:bold;
"
>

Complete Creator Setup

</a>

</div>

`

);