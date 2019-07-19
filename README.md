     var config = {
       currency: '$',
       fen: '70b 50B 100 100 100!20(30 50 . . .)~10!0\nR20 R20',
       clock: {
         running: true,
         initial: 60,
         times: 60,
       },
       pov: {
         seats: [{ img: 'https://i.pravatar.cc/300?1' },
                 { img: 'https://i.pravatar.cc/300?2' },
                 { img: 'https://i.pravatar.cc/300?2' },
                 { img: 'https://i.pravatar.cc/300?2' },
                 { img: 'https://i.pravatar.cc/300?3' }],
         // index to seats involved in hand
         handIndexes: [0, 1, 2, 3, 4]
       },
       events: {
         sit: (index) => {
           apiSit(index);
         }
       }
     };


    // showdown object
    {
       middle: {
         flop: 'As Tc Qd',
         turn: 'Kh',
         river: '2c'
       },
       // player hands
       // according seat index for an hands index is mapped to handIndexes
       // null for mucked hands
       hands: [
         { hole: 'Kc Jh', rank: 'straight', hand: 'As Kh Qd Jh Tc' },
         null,
         null,
         null,
         null
       ],
       pots: [
         { amount: 16000,
           // index to seats involved in pot
           involved: [handIndexes[0]]
         }
       ]
     };
