import { useState } from 'react';
import {
    Box, Drawer, AppBar, Toolbar, List, CssBaseline, Typography, Divider, IconButton, ListItem,
    ListItemIcon, ListItemText
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import SettingsIcon from '@mui/icons-material/Settings';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '@/store/themeSlice';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { Button } from '@mui/material';

const drawerWidth = 240;

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

export default function Layout({ children }) {
    const [open, setOpen] = useState(true);
    const dispatch = useDispatch();
    const mode = useSelector((state) => state.theme.mode)

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />

            {/* App Bar */}
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                        <IconButton color="inherit" edge="start" onClick={() => setOpen(!open)} sx={{ mr: 2 }}>
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" noWrap>
                            Inventory Dashboard
                        </Typography>
                    </Box>

                    {/* Right Side Button */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Button onClick={() => dispatch(toggleTheme())} variant="">
                            {mode === 'light' ? <LightModeIcon /> : <DarkModeIcon />}
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>


            {/* Sidebar Drawer */}
            <Drawer
                variant="permanent"
                open={open}
                sx={{
                    width: open ? drawerWidth : 64,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: open ? drawerWidth : 64,
                        transition: 'width 0.3s',
                        overflowX: 'hidden',
                    },
                }}
            >
                <Toolbar />
                <Divider />
                <List>
                    {menuItems.map(({ text, icon }, index) => (
                        <ListItem button key={text}>
                            <ListItemIcon>{icon}</ListItemIcon>
                            {open && <ListItemText primary={text} />}
                        </ListItem>
                    ))}
                </List>
            </Drawer>

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar /> {/* Space under AppBar */}
                {children}
            </Box>
        </Box>
    );
}
