import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
  
})

export class AppComponent {
  title = 'titans';
  file:any;

  //for pipelining
  public is_forwarded=false;
  public clocks=0;
  public total_instructions=0;
  public stalls=0;
  public hazard=[-1, -1];
  public prev_op = "";
  public IPC = 0;
  public stalled_inst = [""];

  public sometext='';
  public registers=[0];
  instructions = '';
  public code=[''];
  public temp='';
  output=[''];
  public names=[''];
  public memory=[''];
  public index=[-1];
  public variables=new Map(
    [
      ["",-1]
    ]
  );
  public reg_name= new Map([
    ["$r0",0], ["$at",1], ['$v0',2], ['$v1',3], ['$a0',4], ['$a1',5], ['$a2',6], ['$a3',7], ['$t0',8], ['$t1',9], ['$t2',10],
    ['$t3',11], ['$t4',12], ['$t5',13], ['$t6',14], ['$t7',15], ['$s0',16], ['$s1',17], ['$s2',18], ['$s3',19], ['$s4',20 ],['$s5',21],[ '$s6',22], ['$s7',23], ['$t8',24],
       ['$t9',25], ['$k0',26], ['$k1',27], ['$gp',28], ['$sp',29], ['$s8',30],['$ra',31]
  ]);
  constructor()
  {
    for(let i=0;i<32;++i)
    this.registers.push(0);
  }
  
  fileChanged(e:any) {
      this.file = e.target.files[0];
  }
  uploadDocument() {
    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      this.instructions+=(fileReader.result);
    }
    fileReader.readAsText(this.file);
  }
  spliting_lines()
  {
    for(let i=0;i<this.instructions.length;i++)
    {
      if(this.instructions[i]=='\n' )
      {
        if(this.temp!="")
        this.code.push(this.temp);
        this.temp='';
      }
      else if(this.instructions[i]==':')
      {
        this.temp+=this.instructions[i];
        this.code.push(this.temp);
        this.temp='';
      }
      else
      {
        if(this.instructions[i]!=' ' && this.instructions[i]!='\t')
        this.temp+=this.instructions[i];
      }
    }
    if(this.temp!="")
    this.code.push(this.temp);
    
  }
  labels()
  {
    let i=this.finding_text();
    if(i!=0)
    for( ;i<this.code.length;i++)
    {
      this.temp='';
      for(let j=0;j<this.code[i].length;j++)
      {
        if(this.code[i][j]==':')
        {
          this.names.push(this.temp);
          this.index.push(i);
        }
        else
          this.temp+=this.code[i][j];
      }
    }
  }
  finding_text()
  {
    let i;
    let flag=true;
    for( i=1;i<this.code.length;i++)
    {
      if(this.code[i][0]=='.'||this.code[i][0]==' ')
      {
          let j=0;
          if(this.code[i][j]!='.')
          continue;
          if(this.code[i][j+1]=='t')
          {
            if(this.code[i][j+2]=='e'&&this.code[i][j+3]=='x'&&this.code[i][j+4]=='t')
            {
              break;
            }
            else
            {
              this.output.push('\n Error in line'+i);
              flag=false;
            }
          }
      }
    }
    if(i==this.code.length)
    {
      this.output.push('\n Error: Did not find text keyword');
      return 0;
    }
    return i;
  }
  finding_data()
  {
    let i;
    let flag=true;
    for( i=1;i<this.code.length;i++)
    {
      if(this.code[i][0]=='.'||this.code[i][0]==' ')
      {
          let j=0;
          if(this.code[i][j]!='.')
          continue;
          if(this.code[i][j+1]=='d')
          {
            if(this.code[i][j+2]=='a'&&this.code[i][j+3]=='t'&&this.code[i][j+4]=='a')
            {
              break;
            }
            else
            {
              this.output.push('\n Error in line'+i);
              flag=false;
            }
          }
      }
    }
    if(i==this.code.length)
    {
      this.output.push('\n Warning: Did not find data keyword');
      return 0;
    }
    return i;
  }

  //pipelining without forwarding
  pipeline_wf( operation:string, reg1:number, reg2:number, pointer:number){
      this.total_instructions++;
      if(reg1==this.hazard[1]||reg2==this.hazard[1]){
        this.stalls+=2;
        this.clocks+=2;
        this.hazard.shift();
        this.hazard.push(-1);
        if(this.stalled_inst[this.stalled_inst.length-1]!=this.code[pointer])
          this.stalled_inst.push(this.code[pointer]);
      }
      else if(reg1==this.hazard[0]||reg2==this.hazard[0]){
        this.stalls+=1;
        this.clocks+=1;
        if(this.stalls%2==0){
          this.hazard.shift();
          this.hazard.push(-1);
        }
        if(this.stalled_inst[this.stalled_inst.length-1]!=this.code[pointer])
          this.stalled_inst.push(this.code[pointer]);
      }
  }

  //with forwarding
  pipeline_f(operation:string, reg1:number, reg2:number, pointer:number){
    this.total_instructions++;
    if(reg1==this.hazard[1] || reg2==this.hazard[1]){
      if(this.prev_op==="la"||this.prev_op==="lw"||this.prev_op==="sw"||operation==="bne"||operation==="beq"||operation==="blt"){
        this.stalls+=1;
        this.clocks+=1;
        if(this.stalled_inst[this.stalled_inst.length-1]!=this.code[pointer])
          this.stalled_inst.push(this.code[pointer]);
      }
    }
  }

  run()
  {
    this.output=[''];
    this.temp='';

    // spliting into individual strings
    this.spliting_lines();

    //finding all the labels and storing them
    this.labels();

    let i;
    let flag=true;
    i=this.finding_data();
    flag=Boolean(i);
    i++;
    if(flag)
    {
      while(this.code[i][0]!='.')
      {
        let k=0;
        while(this.code[i][k]!=':')
        {
          k++;
        }
        this.temp=this.code[i].substring(0,k);
        if(k+1==this.code[i].length)
        {
          i++;
          if(this.code[i][0]=='.'&&this.code[i][1]=='w'&&this.code[i][2]=='o'&&this.code[i][3]=='r'&&this.code[i][4]=='d')
          {
            let value=this.code[i].substring(5,this.code[i].length);
            let point=this.memory.length;
            this.variables.set(this.temp,point);
            let q,n=0;
            for(q=0;q<value.length;q++)
            {
              if(value[q]==',')
              {
                this.memory.push(n.toString(10) );
                n=0;
              }
              else
              {
                n*=10;
                n+=parseInt(value[q],10) ;
              }
            }
            this.memory.push(n.toString(10) );
            
          }
          else if(this.code[i][0]=='.'&&this.code[i][1]=='a'&&this.code[i][2]=='s'&&this.code[i][3]=='c'&&this.code[i][4]=='i'&&this.code[i][5]=='i'&&this.code[i][6]=='z')
          {
            let value=this.code[i].substring(7,this.code[i].length);
            this.memory.push(value);
            let point=this.memory.length;
            this.variables.set(this.temp,point-1);
          }

        }
        i++;
      }
    }
    //finding .text
    flag=Boolean( this.finding_text());
    if(flag)
    {
        let pointer=this.find('main',this.names,this.index);
        if(pointer==-1)
        {
          this.output.push("Main not found"); 
        }
        pointer++;
        this.clocks=4;
        while(pointer<this.code.length)
        {
          let j=0;
            let k=j;
            while(++k&&k<this.code[pointer].length)
            {
              if(this.code[pointer][k]==':')
              {
                pointer++;
                break;
              }
            }
            if(k<this.code[pointer].length)
            continue;
            this.clocks++;
            if(this.code[pointer][j]=='a')
            {
              
                //addi
                if(this.code[pointer][j+1]=='d'&&this.code[pointer][j+2]=='d' && this.code[pointer][j+3] == 'i')
                {
                  j=j+4;
                  let a:number = 0, b:number =0, c:number =0;
                  if(this.code[pointer][j]=='$')
                  {
                    this.temp=this.code[pointer].substring(j,j+3);
                    a=Number(this.reg_name.get(this.temp));
                    this.temp=this.code[pointer].substring(j+4,j+7);
                    b=Number(this.reg_name.get(this.temp));
                    this.temp=this.code[pointer].substring(j+8,j+11);
                    c = parseInt(this.temp, 10);
                    this.registers[a]=this.registers[b]+c;
                    
                    if(!this.is_forwarded){
                      this.pipeline_wf("addi", b, -2, pointer);
                    }
                    else{
                      this.pipeline_f("addi", b, -2, pointer);
                      this.prev_op="addi";
                    }
                    this.hazard.push(a);
                    this.hazard.shift();
                  }
                  else
                  {
                    this.output.push('\n Error in line '+pointer);
                    break;
                  }
                }
                //add
                else if(this.code[pointer][j+1]=='d'&&this.code[pointer][j+2]=='d')
                {
                  j=j+3;
                  let a:number = 0, b:number =0, c:number =0;
                  if(this.code[pointer][j]=='$')
                  {
                    this.temp=this.code[pointer].substring(j,j+3);
                    a=Number(this.reg_name.get(this.temp));
                    this.temp=this.code[pointer].substring(j+4,j+7);
                    b=Number(this.reg_name.get(this.temp));
                    this.temp=this.code[pointer].substring(j+8,j+11);
                    c=Number(this.reg_name.get(this.temp));
                    this.registers[a]=this.registers[b]+this.registers[c];

                    if(!this.is_forwarded){
                      this.pipeline_wf("add", b, c, pointer);
                    }
                    else{
                      this.pipeline_f("add", b, c, pointer);
                      this.prev_op="add";
                    }
                    this.hazard.push(a);
                    this.hazard.shift();  
                  }
                  else
                  {
                    this.output.push('\n Error in line '+pointer);
                    break;
                  }
                }
            }
            else if(this.code[pointer][j]=='s')
            {
                //sub,srl,sw
                if(this.code[pointer][j+1]=='u'&&this.code[pointer][j+2]=='b')
                {
                  j=j+3;
                  let a:number  = 0, b:number =0, c:number =0;
                  if(this.code[pointer][j]=='$')
                  {
                    this.temp=this.code[pointer].substring(j,j+3);
                    a=Number( this.reg_name.get(this.temp));
                    this.temp=this.code[pointer].substring(j+4,j+7);
                    b=Number (this.reg_name.get(this.temp));
                    this.temp=this.code[pointer].substring(j+8,j+11);
                    c=Number(this.reg_name.get(this.temp));
                    this.registers[a]=this.registers[b]-this.registers[c];

                    if(!this.is_forwarded){
                      this.pipeline_wf("sub", b, c, pointer);
                    }
                    else{
                      this.pipeline_f("sub", b, c, pointer);
                      this.prev_op="sub";
                    }
                    this.hazard.push(a);
                    this.hazard.shift();  
                  }
                  else
                  {
                    this.output.push('\n Error in line '+pointer);
                    break;
                  }
                }
                else if(this.code[pointer][j+1]=='r'&&this.code[pointer][j+2]=='l')
                {
                  //srl r1,r2,num->r1=r2*2^-num
                  j=j+3;
                  let a:number  = 0, b:number =0, c:number =0;
                  if(this.code[pointer][j]=='$')
                  {
                    this.temp=this.code[pointer].substring(j,j+3);
                    a=Number(this.reg_name.get(this.temp));
                    this.temp=this.code[pointer].substring(j+4,j+7);
                    b=Number(this.reg_name.get(this.temp));
                    this.temp=this.code[pointer].substring(j+8,this.code[pointer].length);
                    c=parseInt(this.temp) ;
                    this.registers[a]=Math.floor( this.registers[b]/Math.pow(2,c) );

                    if(!this.is_forwarded){
                      this.pipeline_wf("srl", b, -2, pointer);
                    }
                    else{
                      this.pipeline_f("srl", b, -2, pointer);
                    }
                    this.hazard.push(a);
                    this.hazard.shift();
                  }
                  else
                  {
                    this.output.push('\n Error in line '+pointer);
                    break;
                  }
                }
                else if(this.code[pointer][j+1] == 'w')
                {
                  j=j+2;
                  let a:number,c:number=0;
                  if(this.code[pointer][j]=='$')
                  {
                    this.temp=this.code[pointer].substring(j,j+3);
                    a=Number(this.reg_name.get(this.temp));
                    c=0;
                      j=j+4;
                      let q=0;
                      while(this.code[pointer][j]!='(')
                      {
                        q*=10;
                        q+=parseInt(this.code[pointer][j],10);
                        j++;
                      }

                      this.temp=this.code[pointer].substring(j+1,j+4);//$t1
                      c=Number(this.reg_name.get(this.temp));//c=reg t1 index

                      if(!this.is_forwarded){
                        this.pipeline_wf("sw", a, -2, pointer);
                      }
                      else{
                        this.pipeline_f("sw", a, -2, pointer);
                        this.prev_op = "sw";
                      }

                      this.hazard.push(c);
                      this.hazard.shift();

                      c=this.registers[c];//value of reg t1 aka memory index
                      c+=q/4;//add offset
                      
                    
                    this.memory[c] = String(this.registers[a]);
                  }
                }
            }
            else if(this.code[pointer][j]=='m')
            {
                //mul
                if(this.code[pointer][j+1]=='u'&&this.code[pointer][j+2]=='l')
                {
                  j=j+3;
                  let a:number  = 0, b:number=0, c:number=0;
                  if(this.code[pointer][j]=='$')
                  {
                    this.temp=this.code[pointer].substring(j,j+3);
                    a=Number(this.reg_name.get(this.temp));
                    this.temp=this.code[pointer].substring(j+4,j+7);
                    b=Number(this.reg_name.get(this.temp));
                    this.temp=this.code[pointer].substring(j+8,j+11);
                    c=Number(this.reg_name.get(this.temp));
                    this.registers[a]=this.registers[b]*this.registers[c];

                    if(!this.is_forwarded){
                      this.pipeline_wf("mul", b, c, pointer);
                    }
                    else{
                      this.pipeline_f("mul", b, c, pointer);
                      this.prev_op = "mul";
                    }
                    this.hazard.push(a);
                    this.hazard.shift();
                  }
                  else
                  {
                    this.output.push('\n Error in line '+pointer);
                    break;
                  }
                }
            }
            else if(this.code[pointer][j]=='d')
            {
                //div
                if(this.code[pointer][j+1]=='i'&&this.code[pointer][j+2]=='v')
                {
                  j=j+3;
                  let a:number = 0, b:number =0, c:number =0;
                  if(this.code[pointer][j]=='$')
                  {
                    this.temp=this.code[pointer].substring(j,j+3);
                    a=Number(this.reg_name.get(this.temp));
                    this.temp=this.code[pointer].substring(j+4,j+7);
                    b=Number(this.reg_name.get(this.temp));
                    this.temp=this.code[pointer].substring(j+8,j+11);
                    c=Number(this.reg_name.get(this.temp));
                    this.registers[a]=Math.floor( this.registers[b]/this.registers[c]);

                    if(!this.is_forwarded){
                      this.pipeline_wf("div", b, c, pointer);
                    }
                    else{
                      this.pipeline_f("div", b, c, pointer);
                      this.prev_op = "div";
                    }
                    this.hazard.push(a);
                    this.hazard.shift();
                  }
                  else
                  {
                    this.output.push('\n Error in line '+pointer);
                    break;
                  }
                }
            }
            else if(this.code[pointer][j]=='b')
            {
                //bne r1,r2,label
                if(this.code[pointer][j+1]=='n'&&this.code[pointer][j+2]=='e')
                {
                  j=j+3;
                  let a:number  = 0, b:number =0, c:number =0;
                  if(this.code[pointer][j]=='$')
                  {
                    this.temp=this.code[pointer].substring(j,j+3);
                    a=Number(this.reg_name.get(this.temp));
                    this.temp=this.code[pointer].substring(j+4,j+7);
                    b=Number(this.reg_name.get(this.temp));
                    this.temp=this.code[pointer].substring(j+8,this.code[pointer].length);
                    if(this.registers[a]!=this.registers[b])
                    pointer=this.find(this.temp,this.names,this.index);
                                  
                    if(!this.is_forwarded){
                      this.pipeline_wf("bne", a, b, pointer);
                    }
                    else{
                      this.pipeline_f("bne", a, b, pointer);
                      this.prev_op = "bne";
                    }
                    this.stalled_inst.push(this.code[pointer+1]);
                    this.stalls++;
                    this.clocks++;
                    this.hazard.push(-1);
                    this.hazard.shift();
                    this.hazard.push(-1);
                    this.hazard.shift();
                  }
                  else
                  {
                    this.output.push('\n Error in line '+pointer);
                    break;
                  }
                }
                else if(this.code[pointer][j+1]=='e'&&this.code[pointer][j+2]=='q')
                {
                  j=j+3;
                  let a:number  = 0, b:number =0, c:number =0;
                  if(this.code[pointer][j]=='$')
                  {
                    this.temp=this.code[pointer].substring(j,j+3);
                    a=Number(this.reg_name.get(this.temp));
                    this.temp=this.code[pointer].substring(j+4,j+7);
                    b=Number(this.reg_name.get(this.temp));
                    this.temp=this.code[pointer].substring(j+8,this.code[pointer].length);
                    if(this.registers[a]==this.registers[b])
                    pointer=this.find(this.temp,this.names,this.index);

                    if(!this.is_forwarded){
                      this.pipeline_wf("beq", a, b, pointer);
                    }
                    else{
                      this.pipeline_f("beq", a, b, pointer);
                      this.prev_op = "beq";
                    }
                    this.stalled_inst.push(this.code[pointer+1]);
                    this.stalls++;
                    this.clocks++;
                    this.hazard.push(-1);
                    this.hazard.shift();
                    this.hazard.push(-1);
                    this.hazard.shift();
                  }
                }
                  else if(this.code[pointer][j+1]=='l'&&this.code[pointer][j+2]=='t')
                {
                  j=j+3;
                  let a:number  = 0, b:number =0, c:number =0;
                  if(this.code[pointer][j]=='$')
                  {
                    this.temp=this.code[pointer].substring(j,j+3);
                    a=Number(this.reg_name.get(this.temp));
                    this.temp=this.code[pointer].substring(j+4,j+7);
                    b=Number(this.reg_name.get(this.temp));
                    this.temp=this.code[pointer].substring(j+8,this.code[pointer].length);

                    if(!this.is_forwarded){
                      this.pipeline_wf("blt", a, b, pointer);
                    }
                    else{
                      this.pipeline_f("blt", a, b, pointer);
                      this.prev_op = "blt";
                    }
                    this.stalled_inst.push(this.code[pointer+1]);
                    this.stalls++;
                    this.clocks++;
                    this.hazard.push(-1);
                    this.hazard.shift();
                    this.hazard.push(-1);
                    this.hazard.shift();

                    if(this.registers[a]<this.registers[b]){
                      pointer=this.find(this.temp,this.names,this.index);
                    }
                  }
                  else
                  {
                    this.output.push('\n Error in line '+pointer);
                    break;
                  }
                }
                else{
                  this.output.push("Error in line " + pointer);
                }
              
            }
            else if(this.code[pointer][j]=='j')
            {
                //jump label
                this.temp=this.code[pointer].substring(j+1,this.code[pointer].length);
                pointer=this.find(this.temp,this.names,this.index);

                this.stalls++;
                this.clocks++;
                this.total_instructions++;
                this.stalled_inst.push(this.code[pointer]);
                this.prev_op = "j";
                this.hazard.push(-1);
                this.hazard.shift();
                this.hazard.push(-1);
                this.hazard.shift();
            }
            else if(this.code[pointer][j]=='l')
            {
              //lw $t1,0($t2)==$t1=0+$t2
              //lw $t1,label
              //lw $t1,($t2)
              if(this.code[pointer][j+1]=='w')
              {
                j=j+2;
                let a:number=0,c:number;
                  if(this.code[pointer][j]=='$')
                  {
                    this.temp=this.code[pointer].substring(j,j+3);
                    a=Number(this.reg_name.get(this.temp));
                    c=0;
                    if(this.code[pointer][j+4]!='('&&!(this.code[pointer][j+4]>='0'&&this.code[pointer][j+4]<='9'))
                    {
                      this.temp=this.code[pointer].substring(j+4,this.code[pointer].length);
                      c=Number(this.variables.get(this.temp));
                    }
                    else
                    {
                      j=j+4;
                      let q=0;
                      while(this.code[pointer][j]!='(')
                      {
                        q*=10;
                        q+=parseInt(this.code[pointer][j],10);
                        j++;
                      }

                      this.temp=this.code[pointer].substring(j+1,j+4);//$t1
                      c=Number(this.reg_name.get(this.temp));//c=reg t1 index
                      // c=this.registers[c];//value of reg t1 aka memory index
                      if(!this.is_forwarded){
                        this.pipeline_wf("lw", c, -2, pointer);
                      }
                      else{
                        this.pipeline_f("lw", c, -2, pointer);
                        this.prev_op = "lw";
                      }
                      this.hazard.push(a);
                      this.hazard.shift();

                      c+=q/4;//add offset
                      c = this.registers[c];
                    }
                    this.registers[a]=parseInt( this.memory[c],10);
                  }
              }
              //la $t1,arr
              else if(this.code[pointer][j+1]=='a')
              {
                j=j+2;
                  let a:number,c:number;
                  if(this.code[pointer][j]=='$')
                  {
                    this.temp=this.code[pointer].substring(j,j+3);
                    a=Number(this.reg_name.get(this.temp));
                    this.temp=this.code[pointer].substring(j+4,this.code[pointer].length);
                    c=Number(this.variables.get(this.temp));
                    this.registers[a]=c;

                    this.prev_op = "la";
                    this.hazard.push(a);
                    this.hazard.shift();
                    this.total_instructions++;
                  }
              }
              else if(this.code[pointer][j+1]=='i')
                {
                  j=j+2;
                  let a:number,c:number|undefined;
                  if(this.code[pointer][j]=='$')
                  {
                    this.temp=this.code[pointer].substring(j,j+3);
                    a=Number(this.reg_name.get(this.temp));
                    this.temp=this.code[pointer].substring(j+4,this.code[pointer].length);
                    c=parseInt(this.temp) ;
                    this.registers[a]=c;

                    this.prev_op = "li";
                    this.hazard.push(a);
                    this.hazard.shift();
                    this.total_instructions++;
                  }
                  else
                  {
                    this.output.push('\n Error in line '+pointer);
                    break;
                  }
                }
            }
            else
            {
              this.output.push('\n Error in line '+pointer);
                    break;
            }
            pointer++;
        }
    }
    
    this.IPC = this.total_instructions/this.clocks;
    console.log(this.stalled_inst);
  }

  //to find the labels position
  find(s:string,names:any,index:any)
  {
    let i;
    for(i=0;i<names.length;i++)
    {
      if(names[i]==s)
      return index[i];
    }

    return -1;
  }

  //for reinitializing everything
  Reinitialize()
  {
    for(let i=0;i<32;++i)
    this.registers[i]=0;

    //pipelining
  this.stalls=0;
  this.clocks=0;
  this.hazard = [-1, -1];
  this.total_instructions = 0;
  this.is_forwarded=false;
  this.prev_op = "";
  this.IPC = 0;
  this.stalled_inst = [""];

    this.instructions='';
    this.output=[''];
    this.code=[''];
    this.names=[''];
    this.index=[-1];
    this.file=null;
    this.total_instructions=0;
    this.stalls=0;
    this.memory=[""];
    this.variables=new Map(
      [
        ["",-1]
      ]
    );
  }
}
/*
  Instructions:
1.add, 2.sub, 3.bne reg1!= reg2 label, 4.jump, 5.lw, 6.sw, 7.srl
.text
label:
Register:
0.r0, 1.at, 2.v0, 3.v1, 4.a0, 5.a1, 6.a2, 7.a3, 8.t0, 9.t1, 10.t2
11.t3, 12.t4, 13.t5, 14.t6, 15.t7, 16.s0, 17.s1, 18.s2, 19.s3, 20.s4
21.s5, 22.s6, 23.s7, 24.t8, 25.t9, 26.k0, 27.k1, 28.gp, 29.sp, 30.s8
31.ra
*/