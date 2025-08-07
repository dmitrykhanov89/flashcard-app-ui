import {Outlet, Link} from 'react-router-dom';
import {useAuth} from '../hooks/UseAuth';
import {AppBar, Box, CssBaseline, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography,} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import {useState} from 'react';
import {appBarSx, toolbarSx, drawerSx, drawerToolbarSx, listItemButtonSx, listItemIconSx, listItemTextSx, mainContentSx,} from './Layout.style';
import HomeIcon from '@mui/icons-material/Home';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

/**
 * Основной макет.
 *
 * Содержит AppBar, боковую панель навигации.
 * Также предоставляет кнопку выхода из аккаунта.
 */
export const Layout = () => {
    const {logout} = useAuth();
    const [open, setOpen] = useState(true);

    const toggleDrawer = () => {
        setOpen(!open);
    };

    const buttons = [
        {
            label: 'Home',
            to: '/',
            icon: HomeIcon,
        },
        {
            label: 'Library',
            to: '/library',
            icon: LibraryBooksIcon,
        },
    ];

    return (
        <Box sx={{display: 'flex'}}>
            <CssBaseline/>

            {/* AppBar / Header */}
            <AppBar position="fixed" sx={appBarSx(open)}>
                <Toolbar sx={toolbarSx}>
                    <Typography variant="h6" sx={{ml: 2}}>
                        Home page
                    </Typography>
                    <IconButton color="inherit" onClick={logout}>
                        <LogoutIcon/>
                    </IconButton>
                </Toolbar>
            </AppBar>

            {/* Sidebar */}
            <Drawer variant="permanent" open={open} sx={drawerSx(open)}>
                {/* Кнопка сворачивания сверху */}
                <Toolbar sx={drawerToolbarSx(open)}>
                    <IconButton color="inherit" onClick={toggleDrawer}>
                        {open ? <ChevronLeftIcon/> : <MenuIcon/>}
                    </IconButton>
                </Toolbar>

                <Divider sx={{bgcolor: '#3a3a3a'}}/>

                <List sx={{mt: 2}}>
                    {buttons.map(({label, to, icon: Icon}, index) => (
                        <Link key={to} to={to} style={{textDecoration: 'none', color: 'inherit'}}>
                            <ListItemButton sx={{...listItemButtonSx(open), mb: index !== buttons.length - 1 ? 1 : 0,}}>
                                <ListItemIcon sx={listItemIconSx(open)}>
                                    <Icon/>
                                </ListItemIcon>
                                <ListItemText primary={label} sx={listItemTextSx(open)}/>
                            </ListItemButton>
                        </Link>
                    ))}
                </List>
            </Drawer>

            {/* Main Content */}
            <Box component="main" sx={mainContentSx}>
                <Outlet/>
            </Box>
        </Box>
    );
};
