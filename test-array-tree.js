const arr1=[
    {id:1,data:'a'}
    ,{id:2,pid:7,data:'b'}
    ,{id:3,pid:5,data:'c'}
    ,{id:4,pid:9,data:'d'}
    ,{id:5,pid:2,data:'e'}
    ,{id:6,pid:3,data:'f'}
    ,{id:7,data:'g'}
    ,{id:3,pid:9,data:'h'}
    ,{id:9,pid:3,data:'i'}
    ,{id:10,pid:1,data:'j'}
];

//ok nhu oracle
const createTreeOrder = (arrIn, idKey, parentKey, startWith, level, arrOut) => {
    let myLevel = level?level:1;
    if (arrIn && arrOut && arrIn.length > arrOut.length) {
        let parents = arrIn.filter(x => 
        (x[parentKey] === startWith)
        ||(startWith==null&&x[parentKey]==undefined)
        ||(startWith==undefined&&x[parentKey]==null)
        )
        if (parents) {
            parents.forEach(el => {
                el.$level = myLevel;
                arrOut.push(el);
                createTreeOrder(arrIn, idKey, parentKey, el[idKey], myLevel + 1, arrOut)
            });
        }
    }
}


const createTree = (arrIn,idKey,parentKey,startWith,level)=>{
    let myLevel = level?level:1;
    var roots = arrIn.filter(x=>
        (x[parentKey] === startWith)
        ||(startWith==null&&x[parentKey]==undefined)
        ||(startWith==undefined&&x[parentKey]==null)
        );
    if (roots&&roots.length>0){
         roots.forEach(el => {
            el.$level= myLevel;
            el.$children = createTree(arrIn,idKey,parentKey,el[idKey],myLevel+1)
        })
        return roots;
    }else {
        let leafChildren = arrIn.find(x=>x[idKey]===startWith);
        if (leafChildren){
            leafChildren.$is_leaf = 1;
        }
        return undefined;
    }
}

// let outPut = [];
// createTreeOrder(arr1,"id","pid",null,0,outPut);
// console.log('kq',outPut);

// console.log('subtree'
// , JSON.stringify(createTree(arr1,"id","pid",null))
// );

//order array

