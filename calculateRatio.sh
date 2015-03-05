#!/bin/bash
# -*- ENCODING: UTF-8 -*-

angle=$(echo $1 | awk -F"E" 'BEGIN{OFMT="%10.10f"} {print $1 * (10 ^ $2)}')

r=$(echo $2 | awk -F"E" 'BEGIN{OFMT="%10.10f"} {print $1 * (10 ^ $2)}')
t=$(echo $3 | awk -F"E" 'BEGIN{OFMT="%10.10f"} {print $1 * (10 ^ $2)}')

Cd=0.2
Cl=1.6
p=1.225 #pressure at 15 degrees celsius
v=0.8
chord=0.5
L=$(echo "-1*(1/2)*$Cl*$p*$v^2*(c($angle)+(2*($chord/100)*$r)*s($angle))*2*($chord/100)*$t"|bc -l)
D=$(echo "(1/2)*$Cd*$p*$v^2*((2*($chord/100)*$r)/c($angle))*($chord/100)*$t"|bc -l)

rat=$(echo "scale=5;$L/$D"|bc)
echo $rat>>ratios
echo $rat>ratio
exit