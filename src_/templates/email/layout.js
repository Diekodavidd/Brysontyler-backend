module.exports = function layout(title, body){

return `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8"/>

<meta name="viewport" content="width=device-width, initial-scale=1"/>

</head>

<body style="
margin:0;
padding:0;
background:#050505;
font-family:Arial,sans-serif;
color:#ffffff;
">

<table width="100%" cellpadding="0" cellspacing="0">

<tr>

<td align="center">

<table
width="640"
style="
background:#0c0c0c;
border:1px solid #222;
border-radius:24px;
overflow:hidden;
">

<tr>

<td
style="
padding:40px;
text-align:center;
background:#111;
"
>

<h1
style="
color:#d4af37;
margin:0;
font-size:36px;
"
>

BRYSON TYLER

</h1>

<p
style="
color:#999;
margin-top:8px;
"
>

Premium Content Platform

</p>

</td>

</tr>

<tr>

<td style="padding:50px;">

<h2
style="
font-size:30px;
margin-bottom:25px;
"
>

${title}

</h2>

${body}

</td>

</tr>

<tr>

<td
style="
padding:30px;
background:#080808;
text-align:center;
color:#777;
font-size:13px;
"
>

© ${new Date().getFullYear()} Bryson Tyler

</td>

</tr>

</table>

</td>

</tr>

</table>

</body>

</html>

`;

}