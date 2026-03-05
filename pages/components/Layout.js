import { useState } from 'react';
import React from 'react';
import {
    Box, Drawer, AppBar, Toolbar, List, CssBaseline, Typography, Divider, IconButton, ListItem, Tabs, Tab,
    ListItemIcon, ListItemText, MenuItem, Menu
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import SettingsIcon from '@mui/icons-material/Settings';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '@/store/themeSlice';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import CloseIcon from "@mui/icons-material/Close";
import { Button } from '@mui/material';
import { logout } from '@/store/authSlice';
import { useRouter } from 'next/router';
import KendoGrid from '../KendoGrid';
import PieCharts from '../PieCharts';
import BardCharts from '../BardCharts';
import CreateUser from './CreateUser';
import ItemMaster from './Inventory/ItemMaster';
const drawerWidth = 240;


const menuItems = [
    {
        text: "Sales",
        icon: <DashboardIcon />,
        path: "/dashboard",
        subMenu: [
            { label: "Customer", path: "/Customer" },
            { label: "Sales Invoice", path: "/SalesInvoice" },
            { label: "Payment Receipt", path: "/PaymentReceipt" },
        ],
    },
    {
        text: "Purchase",
        icon: <InventoryIcon />,
        path: "/purchase",
        subMenu: [
            { label: "Vendor", path: "/Vendor" },
            { label: "Purchase Order", path: "/PurchaseOrder" },
            { label: "Purchase Bill", path: "/PurchaseBill" },
            { label: "Bill Payment", path: "/BillPayment" }
        ],
    },
    {
        text: "Inventory",
        icon: <InventoryIcon />,
        path: "/inventory",
        subMenu: [
            // { label: "Item Master", path: "/ItemMaster" },
             { label: "Item List", path: "/ItemList" },
            { label: "Material Issue", path: "/MaterialIssue" },
            { label: "Material Receipt", path: "/MaterialReceipt" },
            { label: "Stock Management", path: "/StockManagement" },
        ],
    },

    {
        text: "Reports",
        icon: <InventoryIcon />,
        path: "/reports",
        subMenu: [
            { label: "All Reports", path: "/AllReports" },
            { label: "Trial Balance", path: "/TrailBalance" },
            { label: "Customer Trial", path: "/CustomerTrial" },
            { label: "Vendor Trial", path: "/VendorTrial" },
            { label: "Stock Trail", path: "/StockTrail" },
        ],
    },
];



export default function Layout({ children, onMenuClick }) {
    const [showCreateUser, setShowCreateUser] = useState(false);
    const { user } = useSelector((state) => state.auth);
    const [open, setOpen] = useState(false);
    const dispatch = useDispatch();
    const mode = useSelector((state) => state.theme.mode)
    const router = useRouter();
    const { role } = useSelector((state) => state.auth);
    const [anchorEl, setAnchorEl] = useState(null);
    const [anchorE2, setAnchorE2] = useState(null);
    const [submenu, setSubmenu] = useState([]);
    const open1 = Boolean(anchorEl);
    const drawerWidth = 140
    const [tabs, setTabs] = useState([
        { label: "Dashboard", component: "Dashboard" }
    ]);
    const [activeTab, setActiveTab] = useState("Dashboard");
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        dispatch(logout());
        router.push("/Login");
        handleClose();
    };

    const handleProfileUpdate = () => {
        router.push("/update-profile");
        handleClose();
    };

    const handleChangePassword = () => {
        router.push("/change-password");
        handleClose();
    };

    const handleOpenSubMenu = (event, subMenuItems) => {
        setAnchorE2(event.currentTarget);
        setSubmenu(subMenuItems);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setAnchorE2(null)
        setSubmenu([]);
    };


    const handleSubMenuClick1 = (item) => {
        setTabs((prev) => {
            // Prevent duplicate tab
            if (!prev.find((tab) => tab.label === item.label)) {
                return [...prev, { label: item.label, component: item.path }];
            }
            return prev;
        });
        setActiveTab(item.label);
        handleClose(); // close dropdown
    };

    const handleSubMenuClick = (item) => {
        setTabs((prev) => {
            if (!prev.find((tab) => tab.label === item.label)) {
                return [...prev, { label: item.label, component: item.path }];
            }
            return prev;
        });
        setActiveTab(item.label);
    };

    const handleCloseTab = (label) => {
        setTabs((prev) => prev.filter((tab) => tab.label !== label));
        if (activeTab === label) {
            setActiveTab("Dashboard"); // fallback when closing active tab
        }
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />

            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: "#0086c7" }}>
                <Toolbar>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                        <IconButton color="inherit" edge="start" onClick={() => setOpen(!open)} sx={{ mr: 2 }}>
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" noWrap>
                            Inventory Dashboard
                        </Typography>
                    </Box>


                    {role === 'admin' && (
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ ml: 2 }}
                            onClick={() => setShowCreateUser(!showCreateUser)}
                        >
                            {showCreateUser ? 'Close Create User' : 'Create User'}
                        </Button>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Button onClick={() => dispatch(toggleTheme())} variant="">
                            {mode === 'light' ? <LightModeIcon /> : <DarkModeIcon />}
                        </Button>
                    </Box>

                    <Button

                        variant="contained"
                        color="error"
                        onClick={handleClick}
                    >
                        {user?.role || "User"}
                    </Button>

                    <Menu
                        anchorEl={anchorEl}
                        open={open1}
                        onClose={handleClose}
                        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                        transformOrigin={{ vertical: "top", horizontal: "right" }}
                        disableScrollLock
                        disablePortal
                        keepMounted

                    >
                        <MenuItem disabled>
                            Logged in as <b>{user?.role}</b>
                        </MenuItem>
                        <Divider />
                        {/* <MenuItem onClick={handleProfileUpdate}>Update Profile</MenuItem> */}
                        {/* <MenuItem onClick={handleChangePassword}>Change Password</MenuItem> */}
                        <Divider />
                        <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>


            {/* Sidebar Drawer */}
            <Drawer
                variant="permanent"
                open={open}
                PaperProps={{
                    sx: {
                        backgroundColor: "#0086c7",
                        color: "#fff",

                    },
                }}
                sx={{
                    width: open ? drawerWidth : 60,
                    flexShrink: 0,
                    backgroundColor: "#0086c7",
                    '& .MuiDrawer-paper': {
                        width: open ? drawerWidth : 60,
                        transition: 'width 0.3s',
                        overflowX: 'hidden',
                    },

                }}
            >
                <Toolbar />
                <Divider />
                {/* <List>
                    {menuItems.map(({ text, icon, subMenu }, index) => (
                        <ListItem
                            button
                            key={text}
                            onClick={(e) => handleOpenSubMenu(e, subMenu)}

                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",

                                justifyContent: "center",

                                py: 2,
                                color: "#fff",
                                "&:hover": {
                                    backgroundColor: "#006a9e",
                                },
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: "auto",
                                    color: "#fff",
                                    mb: 0.5,
                                }}
                            >
                                {icon}
                            </ListItemIcon>

                            <ListItemText
                                primary={text}
                                primaryTypographyProps={{
                                    sx: { fontSize: "0.8rem", textAlign: "center", color: "#fff" },
                                }}
                            />
                        </ListItem>
                    ))}
                </List> */}

                <List>
                    {menuItems.map(({ text, icon, subMenu }, index) => (
                        <React.Fragment key={index}>
                            {/* Main Menu Item */}
                            <ListItem
                                button
                                onClick={(e) => subMenu && handleOpenSubMenu(e, subMenu)}
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "left",
                                    justifyContent: "left",
                                    py: 2,
                                    color: "#fff",
                                    "&:hover": {
                                        backgroundColor: "#006a9e",
                                    },
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: "auto",
                                        color: "#fff",
                                        mb: 0.5,
                                    }}
                                >
                                    {icon}
                                </ListItemIcon>

                                <ListItemText
                                    primary={text}
                                    primaryTypographyProps={{
                                        sx: { fontSize: "0.8rem", textAlign: "left", color: "#fff" },
                                    }}
                                />
                            </ListItem>

                        </React.Fragment>
                    ))}
                </List>


                <Menu
                    anchorEl={anchorE2}
                    open={Boolean(anchorE2)}
                    onClose={handleClose}
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "left" }}
                    keepMounted
                    disableScrollLock
                    disablePortal
                    PaperProps={{
                        sx: {
                            backgroundColor: "#0086c7",
                            color: "#fff",
                            mt: 1,
                        },
                    }}
                    MenuListProps={{
                        sx: {
                            p: 0,
                        },
                    }}
                >
                    {submenu.map((item, i) => (
                        <MenuItem
                            key={i}
                            onClick={() => {
                                handleClose(); // close the menu
                                onMenuClick && onMenuClick(item); // ✅ tell Dashboard to add tab
                            }}
                            sx={{
                                cursor: "pointer",
                                backgroundColor: "#0086c7",
                                color: "#fff",
                                "&:hover": { backgroundColor: "#006a9e" },
                            }}
                        >
                            {item.label}
                        </MenuItem>
                    ))}
                </Menu>


            </Drawer>

            {/* Main Content */}







            <Box component="main" sx={{ flexGrow: 1, p: 2 }}>
                <Toolbar />
                {showCreateUser && role === 'admin' ? (
                    <CreateUser />
                ) : (
                    children
                )}
            </Box>
            {/* 
            <Box sx={{ display: "flex" }}>
                <Drawer variant="permanent">
                    <List>
                        {menuItems.map((menu, index) => (
                            <React.Fragment key={index}>
                                <ListItem>
                                    <ListItemIcon>{menu.icon}</ListItemIcon>
                                    <ListItemText primary={menu.text} />
                                </ListItem>
                                {menu.subMenu?.map((sub, subIndex) => (
                                    <ListItem
                                        button
                                        key={subIndex}
                                        onClick={() => onMenuClick && onMenuClick(sub)}
                                    >
                                        <ListItemText inset primary={sub.label} />
                                    </ListItem>
                                ))}
                            </React.Fragment>
                        ))}
                    </List>
                </Drawer>
                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                    {children}
                </Box>
            </Box> */}
        </Box>
    );
}
