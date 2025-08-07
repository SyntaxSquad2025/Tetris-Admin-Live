const menuItems = {
  items: [
    {
      id: "navigation",
      // title: 'Navigation',
      type: "group",
      icon: "icon-navigation",
      children: [
        {
          id: "dashboard",
          title: "Dashboard",
          type: "item",
          icon: "feather icon-pie-chart",
          url: "/dashboard",
        },
        // {
        //   id: "leaderboard",
        //   title: "Leaderboard",
        //   type: "item",
        //   icon: "feather icon-award",
        //   url: "/leaderboard",
        // },
        {
          id: "usermanagement",
          title: "User Management",
          type: "item",
          icon: "feather icon-user",
          url: "/usermanagement",
        },
        {
          id: "tasks",
          title: "Tasks",
          type: "item",
          icon: "feather icon-plus-circle",
          url: "/tasks",
        },
        {
          id: "telegramads",
          title: "Telegram Ads",
          type: "item",
          icon: "feather icon-plus-square",
          url: "/telegramads",
        },
        {
          id: "gamehistory",
          title: "Game History",
          type: "item",
          icon: "feather icon-play-circle",
          url: "/gamehistory",
        },
        {
          id: "withdrawals",
          title: "Withdrawals",
          type: "collapse",
          icon: "feather icon-credit-card",
          children: [
            {
              id: "allwithdrawals",
              title: "All Withdrawals",
              type: "item",
              url: "/allwithdrawals",
            },
            {
              id: "pendingwithdrawals",
              title: "pending Withdrawals",
              type: "item",
              url: "/pendingwithdrawals",
            },
            {
              id: "rejectedwithdrawals",
              title: "Rejected Withdrawals",
              type: "item",
              url: "/rejectedwithdrawals",
            },
            {
              id: "approvedwithdrawals",
              title: "Approved Withdrawals",
              type: "item",
              url: "/approvedwithdrawals",
            },
            {
              id: "transferwithdrawals",
              title: "Transfer Withdrawals",
              type: "item",
              url: "/transferwithdrawals",
            },
            {
              id: "withdrawalmethods",
              title: "Withdrawal Methods",
              type: "item",
              url: "/withdrawalmethods",
            },
            //   {
            //   id: "withdrawallimits",
            //   title: "Withdrawal Limits",
            //   type: "item",
            //   url: "/withdrawallimits",
            // },
          ],
        },
        // {
        //   id: 'boosters',
        //   title: 'Boosters',
        //   type: 'collapse',
        //   icon: 'feather icon-zap',
        //   children: [
        //     {
        //       id: 'addboosters',
        //       title: 'Add Boosters',
        //       type: 'item',
        //       url: '/addboosters'
        //     },
        //     {
        //       id: 'boostertransactions',
        //       title: 'Booster Transactions',
        //       type: 'item',
        //       url: '/boostertransactions'
        //     },
        //     {
        //       id: 'boostersettings',
        //       title: 'Booster Settings',
        //       type: 'item',
        //       url: '/boostersettings'
        //     }
        //   ]
        // },
        {
          id: "dailyrewards",
          title: "Daily Rewards",
          type: "item",
          icon: "feather icon-star",
          url: "/dailyrewards",
        },
        {
          id: "refferalamount",
          title: "Referral Amount",
          type: "item",
          icon: "feather icon-user-plus",
          url: "/refferalamount",
        },
        {
          id: "level&multiplier",
          title: "Level & Multiplier",
          type: "item",
          icon: "feather icon-x",
          url: "/level&multiplier",
        },
        {
          id: "ticketmanagement",
          title: "Ticket Management",
          type: "item",
          icon: "feather icon-square",
          url: "/ticketmanagement",
        },
        {
          id: "announcement",
          title: "Announcement",
          type: "item",
          icon: "feather icon-mic",
          url: "/announcement",
        },
        {
          id: "logout",
          title: "Logout",
          type: "item",
          icon: "feather icon-log-out",
          url: "/logout",
        },
      ],
    },
    {
      id: "pages",
      // title: 'Pages',
      type: "group",
      icon: "icon-pages",
      children: [],
    },
  ],
};

export default menuItems;
