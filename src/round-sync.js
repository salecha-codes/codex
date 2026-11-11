// Each round stays frozen until every current participant has rendered its arena.
export function pendingPlayers(state,roster,readyRound,inputs){
 return roster.filter(m=>(m.slot===0?readyRound!==state.roundId:inputs[m.slot]?.readyRound!==state.roundId));
}
export function releaseRound(state,roster,readyRound,inputs){
 if(state.roundPhase!=='loading'||pendingPlayers(state,roster,readyRound,inputs).length)return false;
 state.roundPhase='playing';return true;
}
// Route relay and direct snapshots through one ordering gate. A connected channel
// is not proof that packets are arriving; a newer relay snapshot remains useful.
export class SnapshotOrder{
 constructor(){this.reset()}
 reset(){this.round=null;this.epoch=-1;this.tick=-1;this.sequence=-1;this.retired=new Set()}
 accept(s){
  const epoch=s.roundEpoch??0,sequence=s.syncSequence??s.tick;
  if(s.roundId!==this.round){
   if(this.retired.has(s.roundId)||epoch<this.epoch)return false;
   if(this.round)this.retired.add(this.round);
   this.round=s.roundId;this.epoch=epoch;this.tick=-1;this.sequence=-1;
  }
  if(s.tick<this.tick||sequence<=this.sequence)return false;
  this.tick=s.tick;this.sequence=sequence;return true;
 }
}
