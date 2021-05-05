//  Making stats class


function process_res(res){
    let dem_vote = 0; 
    let rep_vote = 0;
    for(let i=0; i<res.length; i++){
        if (res[i].eval()){
            dem_vote += 1;
        }
        else{
            rep_vote += 1;
        }
    }
    return [dem_vote, rep_vote];
} 

class res_dat{
    constructor(res){
        let Y = process_res(res);
        this.dem = Y[0];
        this.rep = Y[1];
    }
}

function get_mean(arr){
    return sum(arr)/arr.length;
}

function get_std(arr){
    let mean = get_mean(arr);
    let tmp = 0;
    for(let i=0; i<arr.length; i++){
        tmp += (arr[i] - mean)**2;
    } 
    return ((1/arr.length)*tmp)**0.5;
}

class stats{
    constructor(res_dat_list){
        this.lim = res_dat_list[0].length;
        let n = res_dat_list.length;
        this.dem_ob = [];
        this.rep_ob = [];
        let dem_win = 0;
        let rep_win = 0;
        let tie = 0;
        for(let i=0; i<res_dat_list.length ;i++){
            this.dem_ob.push(res_dat_list[i].dem);
            this.rep_ob.push(res_dat_list[i].rep);
            if (res_dat_list[i].dem < res_dat_list[i].rep){
                rep_win += 1;
            }
            else if(res_dat_list[i].dem < res_dat_list[i].rep){
                dem_win += 1;
            }
            else{
                tie += 1;
            }
        }
        this.dem_mean = get_mean(this.dem_ob);
        this.dem_std = get_std(this.dem_ob);
        this.rep_mean = get_mean(this.rep_ob)
        this.rep_std = get_std(this.rep_ob);;
        this.winrate_dem = Math.round(dem_win/n);
        this.winrate_rep = Math.round(rep_win/n);
        this.tie_rate = Math.round(tie/n);
    }

    get_obs(){
        let obd = [];
        let obr = [];
        for(let i=0; i<this.dem_ob.length; i++){
            obd.push(this.dem_ob[i]);
            obr.push(this.rep_ob[i]);
        }
        return [obd, obr]
    }

    make_dict(){
        var dem_dict = {};
        var rep_dict = {};
        for(let i=0; i<this.dem_ob.length; i++)
        {
            if(dem_dict[this.dem_ob[i]] == undefined){
                dem_dict[this.dem_ob[i]] = 1;
            }
            else{
                dem_dict[this.dem_ob[i]] += 1;
            }
            if(rep_dict[this.rep_ob[i]] == undefined){
                rep_dict[this.rep_ob[i]] = 1;
            }
            else{
                rep_dict[this.rep_ob[i]] += 1;
            }
        }
        return [dem_dict, rep_dict]
    }
}

const canvas2 = document.getElementById("stats_plot");
const width2 = canvas2.width;
const height2 = canvas2.height;
const ctx2 = canvas2.getContext('2d');
ctx2.fillStyle = '#ffffff';
ctx2.fillRect(0, 0, width2, height2);

let st = simulation(parse_data, X, 200, 'mixed');
present_multi_sim(ctx2, width2, height2, st);

// simulate n times

function simulation(f, X, n, mode){
    var rl = [];
    for(let i = 0; i<n; i++){
        var elec = new election(f, pars = X);
        if (mode == 'SMD'){
            el = new SMD_election(elec, pars = X);
        }
        else if (mode == 'PLPR'){
            el = new PLPR_election(elec, pars = X);
        }
        else if(mode = 'ND'){
            el = new ND_election(elec, pars = X);
        }
        else{
            el = new mixed_election(elec, pars = X);
        }
        el.count();
        var res = el.report();
        rl.push(new res_dat(res));
    }
    var st = new stats(rl);
    return st;
}

// present repetition data;

function draw_bar(ctx, ll_x, ll_y, wid, hi, col){
    ctx.beginPath(); //set the path to empty
    ctx.moveTo(ll_x,ll_y); 
    ctx.lineTo(ll_x,ll_y-hi);
    ctx.lineTo(ll_x+wid,ll_y-hi);
    ctx.lineTo(ll_x+wid,ll_y);
    ctx.closePath(); //add a line back to the first point of this sub-path
    ctx.fillStyle = col;
    ctx.fill();
}

function draw_axis(ctx, xi, yi, xf, yf, wid, color){
    ctx.beginPath();
    ctx.moveTo(xi, yi);
    ctx.lineTo(xf, yf);
    ctx.lineWidth = wid;
    ctx.strokeStyle = color;
    ctx.stroke();
}   

function find_max(arr){
    let res = arr[0];
    for(let i=0; i<arr.length; i++){
        if (arr[i] > res){
            res = arr[i];
        }
    }
    return res;
}

function find_min(arr){
    let res = arr[0];
    for(let i=0; i<arr.length; i++){
        if (arr[i] < res){
            res = arr[i];
        }
    }
    return res;
}

function present_multi_sim(ctx, width, height, st){
    let x_dmax = find_max(st.dem_ob);
    let x_dmin = find_min(st.dem_ob);
    let x_rmax = find_max(st.rep_ob);
    let x_rmin = find_min(st.rep_ob);
    let x_max = find_max([x_dmax, x_rmax]); 
    let x_min = find_min([x_dmin, x_rmin]); 
    let y_max = st.dem_ob.length;
    let num_col = x_max - x_min + 1;
    if(num_col <= 10){
        width = (width-20)/3;
    }
    else if(num_col <= 20){
        width = (width-20)/2;
    }
    else{
        width = width - 20;
    }
    let xlen = width/num_col;
    let col_wid = xlen/2.5;
    
    draw_axis(ctx, 30, height-20, 30 + xlen*num_col, height - 20, "#000000");
    draw_axis(ctx, 30, height-20, 30, 20, "#000000");
    let x0 = 30;
    let y0 = height - 20;
    var dicts = st.make_dict();
    var dd = dicts[0];
    var rd = dicts[1];
    let mark = x_min;
    let dval = 0;
    let rval = 0;
    for(let i=0; i<num_col; i++){
        if(dd[mark] == undefined){
            dval = 0;
        }
        else{
            dval = dd[mark];
            draw_bar(ctx, x0, y0, col_wid, dval*(height-40)/y_max, get_color('Democrat'));
        }
        if(rd[mark] == undefined){
            rval = 0;
        }
        else{
            rval = rd[mark];
            draw_bar(ctx, x0+col_wid, y0, col_wid, rval*(height-40)/y_max, get_color('Republican'));
        }
        ctx.fillStyle = '#000000';
        ctx.fillText(mark.toString(), x0+0.8*col_wid, y0+10);
        mark += 1;
        x0 += xlen;
    }
    ctx.rotate(270 * Math.PI / 180);
    // ctx.fillText('People Vaccinated per hundred', , );
    ctx.font = '20px Arial';
    ctx.fillText('Occurence', -width/2, 15);
    ctx.rotate(90 * Math.PI / 180);
    ctx.fillText('Seats', x0+10, y0+5)
    let dstr1 = 'Democrat Mean:' + (Math.round(st.dem_mean*10)/10).toString();
    let dstr2 = 'Democrat Std:' + (Math.round(st.dem_std*100)/100).toString();
    let rstr1 = 'Republican Mean: ' + (Math.round(st.rep_mean*10)/10).toString();
    let rstr2 = 'Republican Std:' + (Math.round(st.rep_std*100)/100).toString();
    ctx.font = '15px Arial';
    ctx.fillText(dstr1 , x0 + 10, 15);
    ctx.fillText(dstr2 , x0 + 10, 30);
    ctx.fillText(rstr1 , x0 + 10, 45);
    ctx.fillText(rstr2 , x0 + 10, 60);
    return
}
