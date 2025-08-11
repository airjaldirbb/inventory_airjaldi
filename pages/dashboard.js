import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Button } from '@mui/material';
import { toggleTheme } from '@/store/themeSlice';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import Layout from './components/Layout';
export default function Dashboard() {
    const { user } = useSelector((state) => state.auth);
    const router = useRouter();
    const dispatch = useDispatch();
    const mode = useSelector((state) => state.theme.mode)


    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user]);

    if (!user) return null;

    return (
        <>
            <Layout>
                
                <div>Welcome {user.name}</div>
            </Layout>


        </>
    )


}
