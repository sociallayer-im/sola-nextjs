function slotLang(str: string) {
    return function (slots: any[]): string {
        let res = str
        slots.forEach(slot => {
            res = res.replace(/\{(\w+)\}/i, slot)
        })
        return res
    }
}

const langEN = {
    Nav_Wallet_Connect: 'Sign In',
    Nav_Wallet_Disconnect: 'Sign Out',
    Nav_Badge_Page: 'Badge',
    Nav_Event_Page: 'Event',
    Wallet_Title_MetaMask: 'Meta Mask',
    Wallet_Intro_MetaMask: 'Connect to your MetaMask Wallet Or injected explorer wallet',
    Wallet_Title_WalletConnect: 'WalletConnect',
    Wallet_Intro_WalletConnect: 'Connect to your WalletConnect Wallet',
    Wallet_Intro: slotLang('Connect to {wallet}'),
    UserAction_MyProfile: 'My profile',
    UserAction_Disconnect: 'Sign Out',
    Regist_Step_One_Title: 'Set a username',
    Regist_Step_One_Des: 'Please enter English or Chinese characters',
    Regist_Step_One_Placeholder: 'your username',
    Regist_Step_Two_Address_Title: 'Bind your wallet address',
    Regist_Step_Two_Address_Des: 'Please enter your wallet address',
    Regist_Step_Two_Address_Placeholder: 'your wallet address',
    Regist_Step_Two_Email_Title: 'Bind your Email',
    Regist_Step_Two_Email_Des: 'Please enter your Email',
    Regist_Step_Two_Email_Placeholder: 'your Email',
    Regist_Step_Next: 'Next',
    Regist_Title: 'Set a unique Social Layer username',
    Domain_Rule: 'Username can contain the English-language letters a-z, and the digits 0-9. Hyphens can also be used but it can not be used at the beginning and at the end of a username. It should be longer than 6 characters.',
    Regist_Input_Placeholder: 'Your username',
    Regist_Input_Validate: slotLang('Cannot exceed {n} characters'),
    Regist_Input_Validate_2: slotLang('Cannot less then {n} characters'),
    Regist_Input_Validate_3: 'Username contains invalid characters',
    Regist_Input_Validate_4: slotLang('domain contains invalid character: {n}'),
    Regist_Input_Error_Start: 'Username cannot start with "-"',
    Regist_Input_Error_End: 'Username cannot end with "-"',
    Regist_Input_Empty: 'This item cannot be empty',
    Regist_Confirm: 'Confirm',
    Regist_Dialog_Title: 'Your profile will be created with this username: ',
    Regist_Dialog_ModifyIt: 'Edit',
    Regist_Dialog_Create: 'Create',
    Regist_InUse: 'This  username is already in use',
    Profile_User_NotExist: 'The user does not exist',
    Profile_User_MindBadge: 'Send a badge',
    Profile_User_IssueBadge: 'Send a badge to ',
    Profile_User_Qrcode_download: 'Download',
    Profile_Tab_Received: 'Badge',
    Profile_Tab_Basic: 'Basic',
    Profile_Tab_NFTPASS: 'NFT Pass',
    Profile_Tab_Minted: 'Created',
    Profile_Tab_Point: 'Point',
    Profile_Tab_Groups: 'Groups',
    Profile_Tab_Presend: 'Sending',
    Profile_Show_Wallet: 'Your address is',
    Profile_Show_Email: 'Your email is',
    Profile_Show_Close: 'Close',
    Profile_Show_Copy: 'Copy',
    Avatar_Upload_Button: 'Upload',
    BadgeDialog_Btn_Login: 'Login to receive',
    BadgeDialog_Btn_Reject: 'Reject',
    BadgeDialog_Btn_Accept: 'Accept',
    BadgeDialog_Btn_Face2face: 'QR code',
    BadgeDialog_Btn_share: 'Send',
    BadgeDialog_Btn_Issue: 'Send again',
    BadgeDialog_Btn_None_Left: 'What a pity',
    BadgeDialog_Label_Creator: 'Creator',
    BadgeDialog_Label_Token: 'Badge domain',
    BadgeDialog_Label_Issuees: 'Receiver(s)',
    BadgeDialog_Label_action_hide: 'Set as private',
    BadgeDialog_Label_action_public: 'Set as public',
    BadgeDialog_Label_action_top: 'Set to Top',
    BadgeDialog_Label_action_untop: 'UnSet to Top',
    BadgeDialog_Label_hide_tip: 'Only visible to yourself',
    BadgeDialog_Label_Creat_Time: 'Create time',
    BadgeDialog_Label_Private: 'Badge Type',
    BadgeDialog_Label_Private_text: 'Private',
    BadgeDialog_Label_gift_text: 'Gift card',
    BadgeletDialog_title: 'Badge Details',
    BadgeletDialog_presend_title: 'Sending Details',
    BadgeletDialog_invite_title: 'Invite Details',
    BadgeletDialog_gift_title: 'Gift card Details',
    BadgeletDialog_Reason: 'Reason',
    MintBadge_Title: 'Send a badge',
    MintBadge_Upload: 'Badge Image',
    MintBadge_UploadTip: slotLang('Support JPG, GIF, PNG. Max size of {size}'),
    MintBadge_Name_Label: 'Badge Name',
    MintBadge_Name_Placeholder: 'Naming your badge',
    MintBadge_Domain_Label: 'Badge Domain',
    MintBadge_Domain_Placeholder: 'Domain',
    MintBadge_Submit: 'Send to friend',
    MintBadge_Next: 'Next',
    MintBadge_Submit_To: slotLang('Send to {1}'),
    MintBadge_Submiting: 'Sending',
    MintBadge_Domain_Rule: 'The domain is the unique identifier for your badge. <br /> Domains can contain the English-language letters a-z, and the digits 0-9. Hyphens can also be used but it can not be used at the beginning and at the end of a domain name. It should be longer than 4 characters.',
    MintFinish_Title: 'Finish Sending!',
    MintFinish_Button_Later: 'Send later',
    MintFinish_Button_Issue: 'Go to Send',
    IssueBadge_Title: 'Send a badge',
    IssueBadge_Domain: 'Badge Domain',
    IssueBadge_Reason: 'Reason (Optional)',
    IssueBadge_Create_time: 'Created',
    IssueBadge_ReasonPlaceholder: 'Reason for issuing',
    IssueBadge_Issuees: 'receiver(s)',
    IssueBadge_Support: "Support <br />1.wallet address; <br/>2. domain end with '.dot/.eth'; <br /> 3.Social Layer username or user domain",
    IssueBadge_IssueesPlaceholder: "Enter receiver's domain or wallet address",
    IssueBadge_GoToIssue: 'Go to Send',
    IssueBadge_Issuesing: 'Sending',
    IssueBadge_Mint: 'Send',
    IssueBadge_Mint_later: 'Send later',
    IssueBadge_Sendwithlink: 'By link',
    IssueBadge_By_QRcode: 'By QR Code',
    IssueBadge_Sendwithdomain: 'By name',
    IssueBadge_linkbtn: 'Link',
    IssueBadge_Eventbtn: 'Event',
    IssueBadge_Address_List_Title: 'Select receivers',
    IssueBadge_Input_Error: 'Invalid domain, wallet address or username.',
    IssueBadge_Input_Des: 'Input the domain/wallet/email address of the badge that receiver can receive the badge.',
    IssueFinish_Title: 'Share',
    IssueFinish_Share_By_Qrcode: 'Share by QRcode',
    IssueFinish_Share_By_Link: 'Share by Link',
    IssueFinish_CopyLink: 'Copy link',
    IssueFinish_Screenshot: 'Please take a screenshot for sharing',
    IssueFinish_Screenshot_Or: 'or',
    IssueFinish_share: '#1 has sent you an NFT badge: #2. Go and get it! \n' +
        ' It is recommended to use metamask or imToken browser to access the website.\n' +
        ' #3',
    IssueFinish_Share_Card_text_1: 'sent you a badge',
    IssueFinish_Share_Card_text_2: 'Send by @Social Layer',
    Search_Cancel: 'Cancel',
    Search_Label_Domain: slotLang('Domain for "{keyword}":'),
    Search_Label_Badge: slotLang('Badges for "{keyword}":'),
    Home_SubTitle: 'The social honor of your life your life',
    Home_Content: 'Each POAP is a gift from an issuer to collectors, in celebration of a special shared memory.<br>By minting these memories to the blockchain, collectors build a rich tapestry of tokenized experiences which unlock a world of possibilities.',
    Home_SearchPlaceholder: 'Search for Wallet/Domain',
    Home_ButtonLabel: 'Explore my collection',
    Home_ButtonTip: 'Connect Wallet',
    Copied: 'Copied',
    Landing_Title: 'Welcome to <span>Social Layer 🎉</span>',
    Landing_Sub_Tittle_1: 'What is Social Layer ?',
    Landing_Sub_Tittle_2: 'What can you do?',
    Landing_Sub_Tittle_3: 'How to send a badge?',
    Landing_Des_1: "A dApp where anyone can send badges to anyone, building a person's digital identity based on subjective, unquantifiable value. Badge issuance is not subject to third-party review or approval, and the most valuable badges will naturally spring up in the multivalued community.",
    Landing_Des_2: 'Express your feelings towards others by awarding badges, and discover more like-minded people through badges.',
    Landing_Des_3: "Click 'Get Start' to create your own on-chain identity. Go to the profile page and award badges.  As early users, Social Layer will pay gas fees for you.",
    Landing_Des_4: 'For more information: ',
    Landing_White_Paper: 'Social Layer whitepaper',
    Landing_Button: 'Get Start',
    Landing_Badge_Receive: 'Login to receive',
    WhatsApp_Share: slotLang('{domain} send you an NFT badge: {badge}. Go get it! {url}'),
    Login_Title: 'Login using Email',
    Login_alert: 'Please enter a email address',
    Login_solar: 'Login with Social Layer',
    Login_continue: 'Continue',
    Login_Placeholder: 'Your Email',
    Login_option: 'Or more option',
    Login_input_Code_title: 'Check your inbox',
    Login_input_Code_des: slotLang('Enter the code we sent to {email} to complete your account set-up.'),
    Page_Back: 'Back',
    Page_Back_Done: 'Done',
    Picture_Recommend_Title: 'Example',
    Picture_Recommend_Create_By_Canva: 'Create by Canva',
    Picture_Recommend_Download_A_Template: 'Download a template',
    Quantity_input_label: 'Quantity',
    Quantity_Unlimited: 'Unlimited',
    Presend_step: 'Fill in the quantity of badges. <br /> The badges will be sent to the receivers as a link.',
    presend_share_link: '#1 has sent you an NFT badge: #2. Go and get it! \n' +
        ' #3 \n' +
        ' It is recommended to use metamask or imToken browser to access the website.',
    Activity_Badge: 'Group Badges',
    Activity_Calendar: 'Event Schedule',
    Activity_Page_type: 'Activity',
    Activity_State_Registered: 'joining',
    Activity_State_Created: 'Created',
    Activity_Online_Event: 'Online Event',
    Activity_Max_Participations: 'Up to #1 participations',
    Activity_login_title: 'No Registered Events Yet!',
    Activity_login_des: 'Log in to participate in a fun event',
    Activity_login_btn: 'Log in / Sign in',
    Activity_search_placeholder: 'Search events…',
    Activity_no_activity: 'No activity yet～',
    Activity_latest: 'Latest Event',
    Activity_Commended: 'Recommended',
    Activity_Popular: 'Popular',
    Activity_Past: 'Past',
    Activity_Coming: 'Upcoming',
    Activity_Greeting_Morning: 'Good Morning',
    Activity_Greeting_Afternoon: 'Good Afternoon',
    Activity_Greeting_Evening: 'Good Evening',
    Activity_My_Register: 'My register',
    Activity_My_Event: 'My Events',
    Activity_All_Activity: 'All Event',
    Activity_Btn_Create: 'Create an Event',
    Activity_Btn_Modify: 'Modify Event',
    Activity_Create_title: 'Create an Event',
    Activity_Create_Btn: 'Create an Event',
    Activity_Setting_Btn: 'Setting',
    Activity_Setting_title: 'Event Setting',
    Activity_Create_Done: 'Done',
    Activity_Create_Success: 'Create Successfully 🎉',
    Activity_Create_Success_Scan_tips: 'Scan the code <br> and attend the event',
    Activity_Create_Success_Scan_tips_2: '| Activity',
    Activity_Scan_checkin: 'Scan QR code to Check in',
    Activity_Scan_punch_in: 'Scan QR code to Punch in',
    Activity_Registered_participants: 'Registered participants',
    Activity_originators: 'Host',
    Activity_Des: 'Activity content',
    Activity_Participants: 'Participants',
    Activity_Punch_Log: 'Punch Log',
    Activity_Punch_in_BTN: 'Punch in',
    Activity_Cancel_registration: 'Cancel Registration',
    Activity_Form_Cover: 'Cover/Poster (Optional)',
    Activity_Form_Checklog: 'Set as a punch in location',
    Activity_Form_Name: 'Event Name',
    Activity_Form_Details: 'Event Description (Optional)',
    Activity_Form_online_address: 'URL(Optional)',
    Activity_Form_Starttime: 'When will it happen?',
    Activity_Form_Ending: 'When will it Ending?',
    Activity_Form_Where: 'Where is the event taking place?',
    Activity_Form_participants: 'Maximum participants',
    Activity_Form_participants_Min: 'Minimum participants',
    Activity_Form_Guest: 'Invite guests to the event (Optional)',
    Activity_Form_Duration: 'Set Duration',
    Activity_Form_Duration_Cancel: 'Cancel set Duration',
    Activity_Form_Hoster: 'Host',
    Activity_Form_Label: 'Tags',
    Activity_Form_Badge: 'Event badge (Optional)',
    Activity_Form_Wechat: 'Event WeChat group',
    Activity_Form_Wechat_Des: "The QR code is displayed after the participant's successful registration.",
    Activity_Form_Wechat_Account: 'When the QR code is not working, participants can find you through the WeChat ID',
    Activity_Form_Badge_Des: 'When an event participant checks in, he or she automatically receives a badge at the end of the event.',
    Activity_Form_Badge_Select: 'Set a POAP badge for attendees',
    Activity_Form_wechat_Select: 'Select Image',
    Activity_Form_Ending_Time_Error: 'The end time must be later than the start time',
    Activity_Detail_Btn_Modify: 'Edit',
    Activity_Detail_site_Occupied: 'The selected venue is already occupied during the chosen time slot. Please choose a different venue or a different time for the event.',
    Activity_Detail_Btn_Canceled: 'Canceled',
    Activity_Detail_Btn_unjoin: 'Cancel',
    Activity_Detail_Btn_Cancel: 'Cancel Event',
    Activity_Detail_Btn_Checkin: 'Check-in',
    Activity_Detail_Btn_Attend: 'RSVP',
    Activity_Detail_Btn_Joined: 'Joined',
    Activity_Detail_Btn_End: 'Event has ended',
    Activity_Detail_Btn_has_Cancel: 'Event has canceled',
    Activity_Detail_Btn_add_Calender: 'Add to calendar',
    Activity_Detail_Badge: 'Registration for the event, upon completion, will be rewarded with POAP*1',
    Activity_Detail_Guest: 'Guest',
    Activity_Detail_Offline_location: 'Location (Optional)',
    Activity_Detail_Offline_location_Custom: 'Select the location',
    Activity_Detail_Offline_Tg: 'Event Telegram group (Optional)',
    Activity_Detail_Offline_Tg_des: 'The group link will be displayed after participants have been confirmed.',
    Activity_Detail_Online_address: 'Online address',
    Activity_Detail_Btn_AttendOnline: 'Attend online',
    Activity_Detail_min_participants_Alert: slotLang('When the number of participants is less than {1}, the activity may be cancelled. Check-in is available half an hour before the start of the event.'),
    Activity_quantity_Input: 'custom',
    Activity_Detail_Expired: 'Past',
    Activity_Detail_Created: 'Hosting',
    Activity_Detail_Wechat: 'Join WeChat group',
    Activity_Detail_Account: 'Or add WeChat account: ',
    Activity_Calendar_Page_Time: 'Time',
    Activity_Calendar_Page_Name: 'Event',
    Activity_Host_Check_And_Send: 'Check-in and Send POAP',
    Activity_Host_Send: 'Send POAP',
    Activity_Unjoin_Confirm_title: 'Are you sure to leave this event?',
    New_Year_1: 'Cast your New Year wishes into a digital badge.',
    New_Year_2: 'Reason for issuing :',
    New_Year_3: 'Send you a badge, scan <br> the code to get',
    Save_Card: 'Save image',
    Card_Event_Success_1: 'Scan the code',
    Card_Event_Success_2: 'and attend the event',
    Group_invite_title: 'Invite',
    Group_invite_badge_name: slotLang('{groupName} {role}'),
    Group_invite_message: 'Invitation Message',
    Group_invite_receiver: 'Receiver(s)',
    Group_invite_Nondesignated: 'Non-designated',
    Group_invite_Designated: 'Designated',
    Group_invite_default_reason: slotLang('Invite you to become {name} {role}'),
    Group_invite_detail_benefits: 'Benefits',
    Group_invite_detail_benefits_des: slotLang('You will automatically become a member of {n} organization.'),
    Group_invite_share: '#1 has sent you an NFT badge: #2. Go and get it! \n' +
        ' #3 \n' +
        ' It is recommended to use metamask or imToken browser to access the website.',
    Group_regist_confirm: 'Create a group',
    Group_regist_owner: 'Group owner',
    Group_regist_confirm_dialog: 'This group will be created with domain: ',
    Group_regist_des: 'Badges are send to members\nin the name of the organization',
    Group_regist_title: 'Set a unique Social Layer domain for your group!',
    Group_setting_title: 'Settings',
    Group_setting_dissolve: 'Freeze the Group',
    Group_freeze_dialog_title: 'Are you sure you to freeze this group？',
    Group_freeze_dialog_des: 'Once frozen, all information in this group will no longer be displayed and cannot be recovered. Badge award records can still be retrieved.',
    Group_freeze_Dialog_confirm: 'Freeze',
    Group_freeze_Dialog_cancel: 'Cancel',
    Group_relation_ship_member: 'Member',
    Group_relation_ship_owner: 'Owner',
    Follow_detail_followed: 'Followers',
    Follow_detail_following: 'Following',
    Follow_detail_groups: 'Groups',
    Follow_detail_btn_mint: 'Send A badge For Your Group',
    Group_detail_tabs_member: 'Members',
    Group_detail_tabs_Event: 'Events',
    Group_detail_tabs_Invite: 'Invited',
    Group_detail_Join_Time: 'Joined',
    Relation_Ship_Action_Follow: 'Follow',
    Relation_Ship_Action_Followed: 'Followed',
    Relation_Ship_Action_Following: 'Following',
    Relation_Ship_Action_Join: 'Join',
    Relation_Ship_Action_Joined: 'Joined',
    Relation_Ship_Action_Leave: 'Leave group',
    Relation_Ship_Action_Unfollow: 'Unfollow ',
    Empty_Text: 'No Data yet~',
    Empty_No_Badge: 'No badge yet~',
    Empty_No_Present: 'No Sending yet~',
    Empty_No_Group: 'No group yet~',
    Empty_No_Invite: 'No invite yet~',
    Search_Tab_Domain: 'Domain',
    Search_Tab_Badge: 'Badge',
    Search_Tab_Tag: 'Tag',
    Search_Tab_Event: 'Event',
    Badgebook_Dialog_Choose_Badgebook: 'Choose from Badge book',
    Badgebook_Dialog_Choose_Badge: 'Choose from you Created',
    Badgebook_Dialog_Choose_Group_Badge: slotLang('Choose from 「{groupname}」 Created'),
    Badgebook_Dialog_Choose_Draft: 'Choose from Draft',
    Badgebook_Dialog_Cetate_Badge: 'Create a new badge',
    Badgebook_Dialog_Recognition_Badge: 'Basic Badge',
    Badgebook_Dialog_Recognition_Des: 'Basic badge, evaluation of others',
    Badgebook_Dialog_Points: 'Points',
    Badgebook_Dialog_Points_Des: 'Create points systems in groups',
    Badgebook_Dialog_Privacy: 'Privacy Badge',
    Badgebook_Dialog_Privacy_Des: 'Only receivers can see the badge',
    Badgebook_Dialog_NFT_Pass: 'NFT Pass',
    Badgebook_Dialog_NFT_Pass_Des: 'Given by the groups to the person',
    Badgebook_Dialog_Gift: 'Gift Card',
    Badgebook_Dialog_Gift_Des: 'Send badge with benefits',
    Dialog_Public_Image_Title: 'Choose a image for badge',
    Dialog_Public_Image_UploadBtn: 'Upload a image',
    Dialog_Public_Image_UploadBtn_Des: 'JPG or PNG. Max size of 800K',
    Dialog_Public_Image_List_Title: 'Public',
    Cropper_Dialog_Title: 'Edit image',
    Cropper_Dialog_Btn: 'Apply',
    Presend_Qrcode_Badge: 'badge',
    Presend_Qrcode_Des: slotLang('{1} sent you a {2}.'),
    Presend_Qrcode_Recommended: 'Recommended',
    Presend_Qrcode_Scan: 'Scan the QR Code',
    Presend_Qrcode_Limit: slotLang('Limited to {1} person'),
    Presend_Qrcode_Time: slotLang('Expiry time : {1}'),
    Presend_Qrcode_Time_2: slotLang('Starts time : {1}'),
    Presend_Qrcode_Expired: 'The badge is no longer valid',
    Presend_Qrcode_Regen: 'Regenerate the QR code',
    Home_Page_New_Title: 'Create a badge',
    Home_Page_New_Des: 'Join now to start creating badges, describing your achievements, and awarding them to deserving individuals.',
    Home_Page_New_Btn: 'Create your badge',
    Badgelet_List_Title: 'Collected',
    Badgelet_List_Unit: 'Badges',
    Created_List_Title: 'Created',
    Dialog_Copy_Btn: 'Ok',
    Dialog_Copy_Title: 'Copied successfully！',
    Dialog_Copy_Message: 'Share and open the link in a browser.',
    Profile_Bio_More: 'More…',
    Profile_Bio_Less: 'Less',
    Profile_Edit_Title: 'Edit Profile',
    Profile_Edit_Avatar: 'Avatar',
    Profile_Edit_Ncikname: 'Nick name',
    Profile_Edit_Bio: 'Bio',
    Profile_Edit_Bio_Placeholder: 'Set a bio',
    Profile_Edit_Location: 'Location',
    Profile_Edit_Social_Media: 'Social media',
    Profile_Edit_Social_Media_Edit: 'Edit',
    Profile_Edit_Social_Media_Edit_Dialog_Title: 'Your ',
    Profile_Edit_Social_Confirm: 'Confirm',
    Profile_Edit_Save: 'Save',
    Profile_Edit_Leave: 'Leave',
    Profile_Edit_Cancel: 'Cancel',
    Profile_Edit_Leave_Dialog_Title: 'Are you sure to leave?',
    Profile_Edit_Leave_Dialog_Des: "You haven't saved your settings yet.",
    Group_Member_Manage_Dialog_Title: 'Member Management',
    Group_Manager_Setting: 'Manager setting',
    Group_Member_Manage_Dialog_Confirm_Btn: 'Remove from the group',
    Group_Member_Manage_Dialog_Confirm_Dialog_des: slotLang('Are you sure to remove {1} from the group？'),
    Group_Member_Manage_Dialog_Confirm_Dialog_Confirm: 'Remove',
    Group_Member_Manage_Dialog_Confirm_Dialog_Cancel: 'Cancel',
    Create_Point_Title: 'Create a point',
    Create_Point_Symbol: 'Symbol',
    Create_Point_Image: 'Image',
    Create_Point_Name: 'Name',
    Create_Point_Name_Placeholder: 'Fill in the name, eg. Knowledge Points',
    Create_Point_Symbol_Placeholder: 'Fill in the symbol, eg. PT',
    Create_Point_Des: 'Description (Optional)',
    Create_NFT_Title: 'Create a NFT Pass',
    Create_NFT_Image: 'Image',
    Create_NFT_Name: 'Name',
    Create_NFT_Name_Placeholder: 'Fill in the name',
    Create_NFT_Name_Domain: 'Domain',
    Create_NFT_Name_Des: 'Description (Optional)',
    Create_Nft_success: 'Create Successfully',
    Create_Nft_success_des: 'Your NFT Pass have been created',
    Issue_Nft_Title: 'Send NFT Pass',
    Issue_Nft_Start: 'Start date',
    Issue_Nft_End: 'Expiry date',
    NFT_Detail_title: 'Nft Pass Details',
    NFT_Detail_checkin_title: 'Check In Records',
    NFT_Detail_Des: 'Description',
    NFT_Detail_Check: 'Check In',
    NFT_Detail_use: 'Use the NFT Pass',
    NFT_Detail_show_record_btn: 'View Records',
    NFT_Detail_Expiration: 'Expiration Date',
    NFT_Detail_Unavailable: 'Not in the validity period',
    Point_Detail_Title: 'Point Detail',
    Create_Point_success: 'Create Successfully',
    Create_Point_success_des: 'Your Points have been created',
    Issue_Point_Title: 'Send Points',
    Issue_Point_Point: 'Points',
    Dialog_Check_In_Title: 'Check In',
    Create_Privacy_Title: 'Create privacy badge',
    Create_Privacy_Tips: 'Only you and the owner can view the badge, others can only see the creator and owner of the badge.',
    Create_Gift_Title: 'Create a Gift card',
    Create_Gift_Benefits: 'Benefits',
    Selector_issue_type_gift: 'Send the Gift card',
    Selector_issue_type_gift_times: 'Amount of benefits',
    Create_gift_success: 'Create Successfully',
    Create_gift_success_des: 'Your Gift card have been created',
    Gift_detail_check_btn: 'Check',
    Gift_Detail_use: 'Use',
    Gift_Detail_amount: 'Times Remaining',
    Gift_Detail_check_remain: slotLang('Checked! Remaining {1} Times'),
    Gift_Checked_Title: 'Checked Successfully',
    Gift_Checked_Des: 'Your benefits have been used.',
    Gift_Checked_Btn: slotLang('Use again (Remaining {1} times)'),
    Gift_Checked_show_remain: slotLang('Remaining {1} times'),
    Gift_Checked_show_receiver: 'receiver',
    Gift_Checked_show_last_consume: 'last consume: ',
    Create_Badge_Success_Title: 'Create Successfully',
    Create_Badge_Success_Des: 'Your badge have been created',
    Selector_issue_type_badge: 'Send the badge',
    Selector_issue_type_amount: 'Badge amount',
    Meeting_Zoom_Title: 'Zoom Meeting',
    Meeting_Google_Title: 'Google Meeting',
    Meeting_Tencent_Title: 'Tencent Meeting',
    Meeting_Others_Title: 'Online meeting',
    Event_Card_Apply_Btn: 'RSVP',
    Event_Card_Applied: 'Registered',
    Login_Phone_Title: 'Login with phone',
    Login_Phone_alert: 'Enter your phone number to receive a verification code',
    Login_Phone_continue: 'Next',
    Login_Phone_Placeholder: 'Your phone number',
    Login_Phone_input_Code_title: 'Verification code',
    Login_Phone_input_Code_des: slotLang('Enter the code we sent to {phone} to complete your account set-up.'),
    Event_Site_Title: 'Venues',
    Event_Site_Remove: 'Remove',
    Event_Site_Location_title: 'Default location',
    Setting_Title: 'Organization Settings',
    Setting_Event_site: 'Venues',
    Setting_Dashboard: 'Dashboard',
    Setting_Participants: 'Number of participants',
    Setting_Hosts: 'Number of hosts',
    Setting_Events: 'Events',
    Setting_Badge: 'Badges received',
    Setting_Banner: 'Banner',
    Setting_Location: 'Default location',
    Setting_Banner_Link: 'Link (Optional)',
    Setting_Permission: 'Event Permission',
    Permission: 'Permission',
    Event_Today: 'Today',
    Event_Tomorrow: 'Tomorrow',
    Event_Label_All: 'All Tags',
    UserAction_Bind_Email: 'Bind Email',
    Bind_Email_Title: 'Bind Email',
    Bind_Email_Des: 'Please enter your email address so that you can log in and receive important notifications via email.',
    Bind_Email_Skip: 'Skip',
    Profile_Tab_Lens: 'Lens',
    Profile_Tab_Asset: 'Asset',
    Profile_Tab_Token: 'Token',
    Profile_Asset_Amount: 'Amount',
    BadgeDialog_Label_Owner: 'Owner',
    BadgeDialog_Label_Sender: 'Sender',
    BadgeDialog_Label_action_Burn: 'Burn',
    BadgeDialog_Label_action_Revoke: 'Revoke',
    Follow_detail_Recently: 'Recently',
    Group_detail_tabs_Vote: 'Votes',
    Group_detail_tabs_Group: 'Board',
    Presend_Qrcode_isGroup: 'Group ',
    Create_Point_Transferable: 'Transferable',
    Create_Point_Transferable_Tips: 'Allows the owner to transfer the badge and its benefits to others.',
    Dialog_Transfer_Title: 'Transfer to',
    Dialog_Transfer_Confirm: 'Transfer',
    Detail_Transfer_Accept_Title_Gift: 'You received an Gift Card',
    Detail_Transfer_Accept_Title_Nft: 'You received an Nft Pass',
    Detail_Transfer_Accept_Title_Point: 'You received an Nft Point',
    Detail_Transfer_Accept_Confirm: 'Ok',
    Detail_Transfer_Accept_From: 'From',
    Dialog_Revoke_Title: 'Select owners',
    Dialog_Revoke_Confirm_Title: 'Are you sure you to burn the badge?',
    Dialog_Revoke_Des: 'Once revoked, the badge and benefits will be invalid, but the record can be found on the chain.',
    Dialog_Revoke_Confirm: 'Revoke',
    Dialog_burn_Title: 'Are you sure you to burn this badge?',
    Dialog_burn_Confirm_des: 'Once burned, the badge and benefits will be invalid, but the record can be found on the chain.',
    Vote_Create_Page_Title: 'Create vote',
    Vote_Create_Title: 'Vote name',
    Vote_Create_Title_Placeholder: 'Fill in title',
    Vote_Create_Des: 'Description (Optional)',
    Vote_Create_Content_Placeholder: 'Fill in description (Optional)',
    Vote_Create_Option_Input_Title: 'Option',
    Vote_Create_Multiple_Choice: 'Multiple choice',
    Vote_Create_Show_Voter: 'Show voters',
    Vote_Create_Auth: 'Voting authority',
    Vote_Create_Auth_Member: 'All members in this group',
    Vote_Create_Auth_Badge: 'Badge owners',
    Vote_Create_Auth_Badge_count: 'Used number of badges as a weight',
    Vote_Create_Has_Expire: 'Closing time for voting',
    Vote_Create_Has_Start: 'Starting time for voting',
    Vote_Create_Create_Btn: 'Create',
    Vote_Create_Voters: 'Voters',
    Vote_Confirm_Dialog_Title: slotLang('Are you sure vote 「{1}」?'),
    Vote_Confirm_Dialog_Confirm: 'Vote it',
    Vote_Confirm_Dialog_Cancel: 'Later',
    Vote_Confirm_Dialog_Des: "You can't change it after you vote it",
    Vote_Confirm_Dialog_Selected: 'Selected：',
    Vote_Already_Voted: 'You have already voted',
    Vote_Close_Time: 'Voting will close at ',
    Vote_Start_Time: 'Voting will start at ',
    Vote_Close_Once: 'You only can select one option',
    Vote_Eligibility_Member: 'Only members in this group can vote',
    Vote_Eligibility_Badge: slotLang('Group member who have the badge 「{1}」can vote'),
    Vote_detail_edit: 'Edit',
    Vote_detail_Title: 'Vote',
    Vote_detail_Cancel: 'Delete',
    Vote_detail_hoster: 'Voting initiator : ',
    Vote_Delete_Vote_title: 'Are you sure you to delete the vote？',
    Vote_Delete_Vote_Des: 'Voting data cannot be recovered after deletion.',
    Month_Name: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    Day_Name: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
    Days: 'Days',
    Minute: 'Mins',
    Form_All_Day: 'All day',
    Form_Repeat_Not: 'Does not Repeat',
    Form_Repeat_Day: 'Every day',
    Form_Repeat_Week: 'Every week',
    Form_Repeat_Month: 'Every month',
    Form_Marker_Title: 'Create a marker',
    Form_Marker_Category: 'Category',
    Form_Marker_Title_Label: 'Title',
    Form_Marker_Des_Label: 'Description (Optional)',
    Form_Marker_Creator_Label: 'Creator',
    Form_Marker_Image_Label: 'Image (Optional)',
    Form_Marker_Badge_Label: 'Check in badge',
    Form_Marker_Badge_Des: 'The badge is automatically sent to the user as a reward after checking in.',
    Form_Marker_Location: 'Location',
    Form_Marker_Create_Btn: 'Create a Marker',
    Form_Marker_Title_Error: 'Title cannot be empty',
    Form_Marker_Location_Error: 'Location cannot be empty',
    Form_Marker_Link_Label: 'Link (Optional)',
    Marker_Detail_Records: 'Records',
    Marker_Edit_Remove: 'Remove marker',
    Group_Change_Owner: 'Change owner',
    Group_Role_Owner: 'Owner',
    Group_Role_Manager: 'Manager',
    Seedao_Role_Text: slotLang('You are {1} in SeeDAO'),
    Seedao_Role_Apply_Issuer: 'Apply to be a issuer',
    Seedao_Notification: 'Notifications',
    Seedao_Send_Badges: 'Send badges',
    Seedao_Issuer_Whitelist: '(Issuer whitelist)',
    Seedao_Issuer_Manager_Whitelist: '(Issuer whitelist, Manager lists)',
    Seedao_Request_Issuer_Dialog_Title: 'Are you sure to apply to be an issuer？',
    Seedao_Request_Issuer_Dialog_Message: 'Leave a message',
    Seedao_Request_Issuer_Dialog_Apply: 'Apply',
    Notification_Title: 'Notifications',
    Seedao_Issue_Badge_Role: 'Role',
    Seedao_Issue_Badge_Section: 'Section',
    Seedao_Issue_Badge_Institution: 'SBT issuing institution',
    Send_The_Badge: 'Send the badge',
    Select_Receivers: 'Select receivers',
    Badge_Amount: 'Badge amount',
    From_Domain: 'From domain',
    From_Csv: 'From csv',
    Issuer: 'Issuer',
    Setting: 'Setting',
    Transfer_Owner: 'Transfer owner',
    Add_Issuer: 'Add Issuer',
    Set_As_Issuer: 'Set as an Issuer',
    Select_From_Members: 'Select from members',
    Remove_Issuer: 'Remove Issuer',
    Send_SeeDAO_Badge: 'Send SeeDAO badge',
    Event_Tag: 'Event tags',
    Received: 'Received',
    Profile_Setting: 'Profile setting',
    Checkins: 'Checkins',
    Comment: 'Comment',
    Sign_To_Comment: 'Sign in to chat',
    Chat: 'Chat',
    Request_To_Be_Issuer: 'Request to be issuer',
    Pending: 'Pending',
    Publish: 'Publish',
    Reject: 'Reject',
    Rejected: 'Rejected',
    Are_You_Sure_To_Publish_This_Event: 'Are you sure to publish this event?',
    Yes: 'Yes',
    No: 'No',
    Are_You_Sure_To_Reject_This_Event: 'Are you sure to reject this event?',
    Ongoing: 'Ongoing',
    Public_Events: 'Public events',
    My_Events: 'My events',
    Publish_Request: 'Publish Request',
    Ticket_Type_Setting: 'Ticket Type Setting',
    Ticket: 'Ticket',
    Name_Of_Tickets: 'Name of Tickets',
    Ticket_Description: 'Ticket description (Optional)',
    Price: 'Price',
    Receiving_Wallet_Address: 'Receiving wallet',
    Ticket_Amount: 'Ticket amount',
    Qualification: 'Qualification (Optional)',
    Tickets: 'Tickets',
    Select_A_Badge: 'Select a badge',
    Get_A_Ticket: 'RSVP',
    External_Url: 'External Url',
    Notifications: 'Notifications',
    Send_You_A_Badge: 'Send you a badge.',
    Go_to_Event_Page: 'Go to event page',
    Back_To_Profile_Page: 'Back to profile page',
    Back_To_Group_Page: 'Back to group page',
    Back_To_Event_Home: 'Back to event home',
    Event_Notes: 'Event Notes',
    Event_Notes_: 'Event Note (Display after confirming attendance)',
    Input_Notes: 'Input the note of the event',
    Featured: 'Featured',
    Chiangmai_Popup_Cities: 'Chiangmai Pop-up Season',
    Events_Of_Popup_Cities: 'Pop Up Cities',
    Communities: 'Communities',
    See_All_Communities: 'See all communities',
    See_All_Popup_Cities_Events: 'See all Pop-up Cities events',
    Go_to: 'Go to',
    My_Badges: 'My badges',
    My_Groups: 'My groups',
    About_Us: 'About us',
    What_s_badge: 'What\'s badge?',
    Development_Doc: 'Development Doc',
    Attended: 'Registered',
    Pending_Requests: 'Pending requests',
    My_Communities: 'My communities',
    My_Subscriptions: 'My subscriptions',
    Timezone: 'Timezone',
    Select_A_Timezone: 'Select a timezone',
    Calendar_View: 'Calendar view',
    Schedule_View: 'Schedule view',
    Timeline_View: 'Timeline view',
    Download_the_list_of_all_participants: 'Download the list of all participants',
    More_Settings: 'More Settings',
    Private: 'Private',
    Go_To_Event_Detail: 'Event detail',
    Create_Next_Event: 'Add another event',
    Promo_Code: 'Promo code',
    Generated_History: 'Generated history',
    Discount_Off: 'Discount off',
    Amount_Off: 'Amount off',
    Can_Be_Used: 'Can be used',
    Times: 'Time(s)',
    Valid_Date: 'Valid date',
    Label_Optional: 'Label(Optional)',
    Generate: 'Generate',
    Promo_Code_Detail: 'Promo code detail',
    You_Have_Generated_Code: slotLang('You have generated a {1} coupon code'),
    Please_Sending_Until: 'Please sending to your guest until',
    Remaining_Uses: 'Remaining uses: ',
    Usage_History: 'Usage history',
    Event: 'Event',
    Ticket_Type: 'Ticket type',
    Need_To_Have_Badge: 'Need to have badge',
    Crypto: 'Crypto',
    Credit_Debit_Card: 'Credit/Debit card',
    Main_Chain: 'Main chain',
    Payment: 'Payment',
    Total: 'Total',
    Original_Price: 'Original price',
    Final_Price: 'Final price',
    Balance: 'Balance',
    Payments_Will_Be_Sent_To: 'Payments will be sent to: ',
    Input_The_Promo_Code: 'Input the coupon code',
    Verify: 'Verify',
    Remove: 'Remove',
    Pay_By_Card: 'Pay by card',
    Retry: 'Retry',
    Apply: 'Apply',
    Confirm: 'Confirm',
    Pay: 'Pay',

}


export type LangConfig = typeof langEN
export default langEN
