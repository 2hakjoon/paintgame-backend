let usedColor = [];

export const unlockColor = (color) =>{
    usedColor.map((clr,index)=>{
        if(clr === color){
            usedColor.splice(index,1);
        }
    })
}


export const rndColor = () => {
    let color = "";
    let check = true;
    while(check){
        color = pickColor();
        check = usedColor.includes(color)
    }
    usedColor.push(color);
    return color;
}

const pickColor = () =>{
    return Colors[Math.floor(Math.random() * Colors.length)];
}

const Colors = [
'black',
'gray',
'maroon',
'purple',
'fuchsia',
'green',
'lime',
'olive',
'yellow',
'navy',
'blue',
'teal',
'orange',
]
