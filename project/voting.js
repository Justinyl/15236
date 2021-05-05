  
// Databank

const new_jersey_2020 = 
[
    {
      Candidate: "",
      District: "1",
      Party: "Dem",
      wvote: "240567",
      lvote: "144463"
    },
    {
      Candidate: "",
      District: "2",
      Party: "Rep",
      wvote: "195526",
      lvote: "173849"
    },
    {
      Candidate: "",
      District: "3",
      Party: "Dem",
      wvote: "229840",
      lvote: "196327"
    },
    {
      Candidate: "",
      District: "4",
      Party: "Rep",
      wvote: "254103",
      lvote: "162420"
    },
    {
      Candidate: "",
      District: "5",
      Party: "Dem",
      wvote: "225175",
      lvote: "193333"
    },
    {
      Candidate: "",
      District: "6",
      Party: "Dem",
      wvote: "199648",
      lvote: "126760"
    },
    {
      Candidate: "",
      District: "7",
      Party: "Dem",
      wvote: "219629",
      lvote: "214318"
    },
    {
      Candidate: "",
      District: "8",
      Party: "Dem",
      wvote: "176758",
      lvote: "58686"
    },
    {
      Candidate: "",
      District: "9",
      Party: "Dem",
      wvote: "203674",
      lvote: "98629"
    },
    {
      Candidate: "",
      District: "10",
      Party: "Dem",
      wvote: "241522",
      lvote: "40298"
    },
    {
      Candidate: "",
      District: "11",
      Party: "Dem",
      wvote: "235163",
      lvote: "206013"
    },
    {
      Candidate: "",
      District: "12",
      Party: "Dem",
      wvote: "230883",
      lvote: "114591"
    }
  ]

  // Constructing basic classes needed
  class Candidate{
    constructor(nm, dst, pty, nv=0){
        this.name = nm;
        this.district = dst;
        dst.add_candidate(this) ;
        this.party = pty;
        pty.add_member(this);
        this.vote = nv;
        this.pop = null;
    }

    set_pop(p){
        this.pop = p;
    }

    set_vote(nv){
        this.vote = nv;
    }

    gt(other){
        return this.vote > other.vote;
    }

    gt_pop(other){
        return this.pop > other.pop;
    }

    view(){
        var dict = {
            'party': this.party.name,
            'vote': this.vote
        };
        return dict;
    }
}

class Party{ 
    constructor(nm, nv=0){
        this.name = nm;
        this.vote = nv;
        this.evote = 0;
        this.members = [];
        this.loyal = null;
        this.pop = null;
    }

    set_loyal(l){
        this.loyal = l;
    }

    set_pop(p){
        this.pop = p;
    }

    add_member(cand){
        this.members.push(cand);
    }

    sum_vote(pars = 1){
        let sum = 0;
        for (let i=0; i<this.members.length; i++){
            sum = sum + this.members[i].vote*pars;
        }
        return sum
    }

    straigh_ticket_vote(pars = 1){
        let res = this.sum_vote(pars = pars);
        this.vote = res;
    }

    gt(other){
        return this.vote > other.vote;
    }
}

class District{
    constructor(nm){
        this.name = nm;
        this.candidates = [];
    }

    add_candidate(cand){
        this.candidates.push(cand);
    }

    display_candidates(){
        var res = []
        for(let i=0; i < this.candidates.length; i++){
            res.push(this.candidates[i]);
        }
        return res;
    }

    sort(){
        var arr = this.candidates;
        if (arr.length <= 1) {return;}
        for(let i=1; i < this.candidates.length; i++){
            let key = arr[i];
            let j = i - 1;
            while(j>=0 && key.gt(arr[j])){
                arr[j+1] = arr[j];
                j -= 1;
            }
            arr[j+1] = key;
        }
        return 
    }
}

class Ballot{
    constructor(districts, parties, candidates, skip = false){
        if (skip){
            return
        }
        this.parties = parties;
        this.candidates = candidates;
        this.districts = districts;
        this.seats = districts.length;
    }

    set_seats(num){
        this.seats = num;
    }

    sort_candidates(){
        var arr = this.candidates;
        if (arr.length <= 1) {return;}
        for(let i=1; i < this.candidates.length; i++){
            let key = arr[i];
            let j = i - 1;
            while(j>=0 && key.gt(arr[j])){
                arr[j+1] = arr[j];
                j -= 1;
            }
            arr[j+1] = key;
        }
        return 
    }

    sort_party(mode = 'straight'){
        // Maybe include split voting in the future
        if(mode == 'straight'){
            for(let i=0; i<this.parties.length; i++){
                this.parties[i].straigh_ticket_vote();
            }
        }
        var arr = this.parties;
        if (arr.length <= 1) {return;}
        for(let i=1; i < this.parties.length; i++){
            let key = arr[i];
            let j = i - 1;
            while(j>=0 && key.gt(arr[j])){
                arr[j+1] = arr[j];
                j -= 1;
            }
            arr[j+1] = key;
        }
        return 
    }

    preprocess_vote(loyal_percentages){
        for (let i=0; i<this.parties.length; i++){
            for (let j=0; j<this.parties[i].members.length; j++)
            {
                var coef = bm_transform();
                var nv_tot = this.parties[i].members[j].vote;
                var nv = loyal_percentages[i]*nv_tot;
                nv += Math.ceil((nv_tot - nv)*(coef/2));
                this.parties[i].members[j].set_vote(nv);
            }
        }
        return
    }

    deep_copy(){  
        var REP = new Party('Republican');
        var DEM = new Party('Democrat');
        var res = new Ballot(undefined, undefined, undefined, true);
        res.parties = [REP, DEM];
        res.districts = [];
        for (let i=0; i<this.districts.length; i++)
        {
            res.districts.push(new District('District ' + (i+1).toString()));
        }

        res.candidates = [];

        for (let i=0; i<this.districts.length; i++){
            if (this.districts[i].candidates[0].party.name == 'Democrat' ){
                res.candidates.push(new Candidate(this.districts[i].candidates[0].name, res.districts[i], DEM, 
                    this.districts[i].candidates[0].vote));
                res.candidates.push(new Candidate(this.districts[i].candidates[1].name, res.districts[i], REP, 
                    this.districts[i].candidates[1].vote));
            }
            else{
                res.candidates.push(new Candidate(this.districts[i].candidates[0].name, res.districts[i], REP, 
                    this.districts[i].candidates[0].vote));
                res.candidates.push(new Candidate(this.districts[i].candidates[1].name, res.districts[i], DEM, 
                    this.districts[i].candidates[1].vote));
            }
        }
        res.seats = res.districts.length;
        return res
    }
}

class election{
    constructor(init_election, pars = null){
        this.start = init_election;
        this.pars = pars;
        this.ballot = init_election(pars);
        this.working_ballot = init_election(pars);
        // this.working_ballot.preprocess_vote(pars[1]);
        this.result = null;
    }

    reset(){
        this.working_ballot = this.ballot.deep_copy() //.preprocess_vote(this.pars[1]); 
    }

    get_pops(){
        var original = this.ballot;
        var model = this.working_ballot;
        let loyal = [];
        let actual = [];
        for (let i=0; i<model.parties.length; i++){
            model.parties[i].set_loyal(this.pars[1][i]);
            loyal.push(original.parties[i].sum_vote(pars = this.pars[1][i]));
            actual.push(model.parties[i].sum_vote());
        }

        var res = {};
        for (let i=0; i<model.parties.length; i++){
            res[model.parties[i].name] = loyal[i];
        }

        for (let i=0; i<model.parties.length; i++){
            model.parties[i].set_pop(loyal[i]/sum(actual));
        }
        let sv = 0;
        for (let i=0; i<model.districts.length; i++)
        {
            let all_swing_votes = [];
            let lv = [];
            for (let j=0; j<model.districts[i].candidates.length; j++)
            {
                lv.push(original.districts[i].candidates[j].vote*model.districts[i].candidates[j].party.loyal);
                all_swing_votes.push(model.districts[i].candidates[j].vote - lv[j]);
            }
            for (let j=0; j<model.districts[i].candidates.length; j++)
            {
                let sasv = 1;
                if (sum(all_swing_votes)==0){
                    sasv = 1;
                }
                else{
                    sasv = sum(all_swing_votes);
                }
                model.districts[i].candidates[j].set_pop(all_swing_votes[j]/sasv);
            }
            sv += sum(all_swing_votes);
        }
        return [res, sv];
    }
}

class SMD_election extends election{
// Single member district(base case)
    constructor(e){
        super(e.start, pars = e.pars);
        this.working_ballot = e.working_ballot;
    }

    count(){
        var model = this.working_ballot;
        for(let i=0; i<model.districts.length; i++){
            model.districts[i].sort();
        }
        this.result = model;
        this.reset();
        return model; 
    }

    report(){
        var res = []
        for(let i=0; i<this.result.seats; i++){
            let pn = this.result.districts[i].candidates[0].party.name;
            res.push(new result(pn));
        }
        return res
    }
}

// utility functions

function sum(arr){
    let s = 0
    for(let i=0; i<arr.length; i++){
        s += arr[i];
    }
    return s
}

function zeros(size){
    var arr = new Array(size);
    for(i=0; i<arr.length; i++){
        arr[i] = 0;
    }
    return arr
}

class BV_election extends election{
// Block Voting
    constructor(e){
        super(e.start, pars = e.pars);
        this.working_ballot = e.working_ballot;
    }

    count(){
        var model = this.working_ballot;
        model.sort_party();
        this.result = model;
        this.reset();
        this.get_raw_res();
        return model; 
    }

    get_raw_res(){
        var model = this.result;
        var tmp = new Array(model.parties.length);
        for (let i=0; i<model.parties.length; i++){
            tmp[i] = model.parties[i].vote;
        }
        let tot = sum(tmp);
        let true_prop = zeros(tmp.length);
        var res = zeros(tmp.length);

        for(i=0; i < res.length; i++){
            true_prop[i] = tmp[i]/tot*model.seats;
            res[i] = Math.trunc(tmp[i]/tot*model.seats);
        }

        let rest = model.seats - sum(res);     
        let remainder = new Array(res.length);
        for(let i=0; i<res.length; i++){
            remainder[i] = [i, true_prop[i] - res[i]];
        }

        function BV_gt(a,b){
            return a[1] > b[1];
        }

        if (remainder.length > 1){
            for(let i=1; i<remainder.length; i++){
                let key = remainder[i];
                let j = i - 1;
                while(j>=0 && BV_gt(key,remainder[j])){
                    remainder[j+1] = remainder[j];
                    j -= 1;
                }
                remainder[j+1] = key;
            }
        }

        for(let i=0; i<remainder.length; i++){
            if(rest == 0){break;}    
            res[remainder[i][0]] += 1;
            rest -= 1;
        }
            
        for(let i=0; i<model.parties.length; i++){
            model.parties[i].evote = res[i];
        }
        return;
    }

    report(){
        var res = []
        let p = this.result.parties;
        for(let i=0; i<p.length; i++){
            let pev = p[i].evote;
            while(pev > 0){
                res.push(new result(p[i].name));
                pev -= 1;
            }
        }
        return res;
    }
}

class ND_election extends election{
    // No district
        constructor(e){
            super(e.start, pars = e.pars);
            this.working_ballot = e.ballot.deep_copy();
        } 

        count(){
            var model = this.working_ballot;
            var out = this.get_pops();
            var dict = out[0];
            var sv = out[1];
            for (let i=0; i < model.candidates.length; i++){
                let v = dict[model.candidates[i].party.name] + model.candidates[i].pop*sv;
                model.candidates[i].set_vote(v);
            }
            model.sort_candidates();
            this.result = model;
            this.reset();
            return model; 
        }
    
        report(){
            var res = []
            let c = this.result.candidates;
            for(let i=0; i<this.result.seats; i++){
                res.push(new result(c[i].party.name));
            }
            return res;
        }
    }

// result class

class raw_result{
    // For party-related voting
    constructor(nm, vt, evt){
        this.name = nm;
        this.vote = vote;
        this.evote = evt;
    }
}

class result{
    constructor(pn){
        this.party_name = pn;
    }
}


// Helper functions for processing vote data for simulation
// Box_Muller transform for normal distributuion

function bm_transform() {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) return randn_bm() // resample between 0 and 1
    return num
  }

// function rdn_vote(coef){
//     var nv_tot = this.parties[i].members[j].vote;
//     var nv = loyal_precentages[i]*nv_tot;
//     nv += Math.ceil((nv_tot - nv)*coef);
//     this.parties[i].members[j].set_vote(nv);
// }

// Constructing geometry of the election map


class coordinate{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }
}

// Oregon test case
function gen_oregon(ctx, width, height, res, xpad = 0.05*width, ypad = 0.05*height){
    const side = 0.2*height;
    pars = []
    pars.push(new coordinate(side, side));
    pars.push(new coordinate(side + 2*side + 2*xpad, side + side + ypad));
    pars.push(new coordinate(side + side + xpad, side));
    pars.push(new coordinate(side + 0.5*side, side + side + ypad));
    pars.push(new coordinate(side + 0.5*side, side + 2*side + 2*ypad));
    fill_squares(ctx, side, res, pars);
}

// Generic

function get_dim(l){
    const sq = [1, 4, 9, 25, 36, 49, 64];
    const base = [1,2,3,4,5,6,7,8];
    for(let i=0; i<sq.length; i++){
        if(sq[i] > l){
            const num_row = base[i];
            const num_col = Math.ceil(l/base[i]);
            const remainder = l % base[i];
            return [num_row, num_col, remainder];
        }
    }
}

function gen_election_res(ctx, width, height, res, padcoef = 0.1){
    const dim = get_dim(res.length);
    const num_row = dim[0];
    const num_col = dim[1];
    const remainder = dim[2];

    const side_tot = 0.8*height/num_row;
    const side = side_tot - padcoef*side_tot;
    var pars = []
    for(let i=0; i<num_row; i++){
        for(let j=0; j<num_col; j++){
            let x = 0.1*height + side_tot*i;
            let y = 0.1*height + side_tot*j;
            pars.push(new coordinate(x, y));
            if ((i==num_row-1) && (j==remainder-1)){
                break;
            }
        }
    }
    fill_squares(ctx, side, res, pars);
}

function get_color(pn){
    if(pn == 'Republican'){
        return '#FF0000';
    }
    else if(pn == 'Democrat'){
        return '#0000FF';
    }
    else if(pn == 'Libertarian'){
        return '#FFFF00';
    }
    else if(pn == 'Pacific Green'){
        return '#008000';
    }
    else{
        EvalError();
    }
}

function fill_squares(ctx, side, res, pars){
    for(let i=0; i<res.length; i++){
        ctx.fillStyle = get_color(res[i].party_name);
        ctx.fillRect(pars[i].x, pars[i].y, side, side);
    }
}

function present(gen, res, pad_coef = 0.1){
    const canvas = document.getElementById("plot");
    const width = canvas.width;
    const height = canvas.height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    gen(ctx, width, height, res, pad_coef = pad_coef);
}


// var elec1 = new SMD_election(oregon_2020, pars = [0.7,0.7,0.7,0.7]);
// var elec2 = new BV_election(oregon_2020, pars = [1,1,1,1]);
// loading files
//import { NJ2020 } from './data_bank.js'
var X = [new_jersey_2020, [0.7, 0.7]];
var elec = new election(parse_data, pars = X);
var elec1 = new SMD_election(elec, pars = X);
var elec2 = new BV_election(elec, pars = X);
var elec3 = new ND_election(elec, pars = X);

elec1.count();
elec2.count();
elec3.count();
res1 = elec1.report(); // Note: Traditional(multidistrict)
res2 = elec2.report(); // Note: Party-proportional single district
res3 = elec3.report(); // Note: No district
present(gen_election_res, res2);

// test case
// test case init


function find_party(pn){
    const dl = 'Dem';
    if (pn == dl){return true;}
    else{ return false;}
}


function parse_data(X){
    arr = X[0];
    // loyal_percentages = X[1];
    const candidate_parties = [];
    const wvotes = [];
    const lvotes = [];
    var num_dist = 0;
    for (let i=0; i<arr.length; i++){
        candidate_parties.push(arr[i]['Party']);
        wvotes.push(parseInt(arr[i]['wvote']));
        lvotes.push(parseInt(arr[i]['lvote']));
        num_dist += 1;
    }
    var REP = new Party('Republican');
    var DEM = new Party('Democrat');
    var parties = [REP, DEM]; 
    var districts = []
    for (let i=0; i<num_dist; i++){
        districts.push(new District('District ' + (i+1).toString()));
    }
    var candidates = []
    for (let i=0; i<num_dist; i++){
        if (find_party(candidate_parties[i])){
            candidates.push(new Candidate('Dem ' + i.toString(), districts[i], DEM, wvotes[i]));
            candidates.push(new Candidate('Rep ' + i.toString(), districts[i], REP, lvotes[i]));
        }
        else{
            candidates.push(new Candidate('Rep ' + i.toString(), districts[i], REP, wvotes[i]));
            candidates.push(new Candidate('Dem ' + i.toString(), districts[i], DEM, lvotes[i]));
        }     
    }
    var res = new Ballot(districts, parties, candidates);
    res.set_seats(num_dist);
    res.preprocess_vote(X[1]);
    return res;
}


function oregon_2020(loyal_percentages = [1,1,1,1]){
    var Dst1 = new District('District One');
    var Dst2 = new District('District Two');
    var Dst3 = new District('District Three');
    var Dst4 = new District('District Four');
    var Dst5 = new District('District Five');
    var districts = [Dst1, Dst2, Dst3, Dst4, Dst5];
    var REP = new Party('Republican');
    var DEM = new Party('Democrat');
    var PRG = new Party('Pacific Green');
    var LIB = new Party('Libertarian');
    var parties = [REP, DEM, PRG, LIB];
    var D1 = new Candidate('D1', Dst1, DEM, 297071);
    var D2 = new Candidate('D2', Dst2, DEM, 168881); 
    var D3 = new Candidate('D3', Dst3, DEM, 343574); 
    var D4 = new Candidate('D4', Dst4, DEM, 240950); 
    var D5 = new Candidate('D5', Dst5, DEM, 234863);

    var R1 = new Candidate('R1', Dst1, REP, 161928); 
    var R2 = new Candidate('R2', Dst2, REP, 273835); 
    var R3 = new Candidate('R3', Dst3, REP, 110570); 
    var R4 = new Candidate('R4', Dst4, REP, 216081); 
    // var R5 = new Candidate('R5', Dst5, REP, 204372);  //change this back
    var R5 = new Candidate('R5', Dst5, REP, 234863); 

    var L2 = new Candidate('L2', Dst2, LIB, 14094);  
    var L3 = new Candidate('L3', Dst3, LIB, 6869); 
    var L5 = new Candidate('L5', Dst5, LIB, 12640); 
    var P3 = new Candidate('P3', Dst3, PRG, 8872); 
    var P4 = new Candidate('P4', Dst4, PRG, 10118); 
    var candidates = [D1, D2, D3, D4, D5, R1, R2, R3, R4, R5, L2, L3, L5, P3, P4];
    var res = new Ballot(districts, parties, candidates);
    res.set_seats(5);
    res.preprocess_vote(loyal_percentages);
    return res;
}

// end of test case init

// testing

// end of test
