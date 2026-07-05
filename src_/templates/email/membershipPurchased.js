const layout=require("./layout");

module.exports=(user,plan)=>layout(

"Membership Activated",

`

<p>

Hi ${user.name},

</p>

<p>

Thank you for upgrading to

<strong>

${plan.toUpperCase()}

</strong>

</p>

<p>

Your membership is now active.

</p>

<p>

Enjoy unlimited premium Bryson Tyler content.

</p>

`

);