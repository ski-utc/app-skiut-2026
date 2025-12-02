import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bus, Map, Phone, LogOut, ChevronRight, Gauge, UserRoundCheck, Shield, Cookie, Home, LucideProps } from 'lucide-react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';

import { Colors, TextStyles, FontSizes } from '@/constants/GraphSettings';
import { useUser } from '@/contexts/UserContext';
import logoImage from '@/assets/images/logo.png';

type CustomDrawerProps = DrawerContentComponentProps;

type DrawerItem = {
    label: string;
    icon: React.FC<LucideProps>;
    onPress: () => void;
}

export default function CustomDrawer({ navigation }: CustomDrawerProps) {
    const { user, setUser } = useUser();

    const handleLogout = () => {
        setUser(null);
        navigation.closeDrawer();
        /* navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'LoginScreen' }],
            })
        ); 
        */
    };

    const navigateToScreen = (screenName: string) => {
        navigation.closeDrawer();

        setTimeout(() => {
            navigation.navigate('MainTabs', {
                screen: 'drawerNavigator',
                params: {
                    screen: screenName
                }
            });
        }, 100);
    };

    const drawerItems: DrawerItem[] = [
        {
            label: 'Contact',
            icon: Phone,
            onPress: () => navigateToScreen('ContactScreen')
        },
        {
            label: 'Plans',
            icon: Map,
            onPress: () => navigateToScreen('PlanScreen')
        },
        {
            label: 'Navettes',
            icon: Bus,
            onPress: () => navigateToScreen('NavettesScreen')
        },
        {
            label: 'Vitesse de glisse',
            icon: Gauge,
            onPress: () => navigateToScreen('VitesseDeGlisseScreen')
        },
        {
            label: "Monopr'UT",
            icon: Cookie,
            onPress: () => navigateToScreen('MonoprutNavigator')
        },
        {
            label: 'RGPD & Données',
            icon: Shield,
            onPress: () => navigateToScreen('RGPDScreen')
        }
    ];

    if (user?.member) {
        drawerItems.push({
            label: 'Tournée des chambres',
            icon: Home,
            onPress: () => navigateToScreen('TourneeChambreScreen')
        });
    }

    if (user?.admin) {
        drawerItems.push({
            label: 'Contrôle Admin',
            icon: UserRoundCheck,
            onPress: () => navigateToScreen('AdminNavigator')
        });
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <Image
                        source={logoImage}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <View style={styles.userTextContainer}>
                        <Text style={styles.userName} numberOfLines={1}>
                            {user?.name} {user?.lastName}
                        </Text>
                        <Text style={styles.userRoom}>
                            {`Chambre ${user?.roomName || 'Non attribuée'}`}
                        </Text>
                    </View>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {drawerItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.drawerItem}
                        onPress={item.onPress}
                        activeOpacity={0.7}
                    >
                        <View style={styles.itemIconContainer}>
                            <item.icon size={20} color={Colors.primary} />
                        </View>
                        <Text style={styles.itemLabel}>{item.label}</Text>
                        <ChevronRight size={20} color={Colors.primaryBorder} />
                    </TouchableOpacity>
                ))}
                <View style={styles.separator} />
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    activeOpacity={0.7}
                >
                    <LogOut size={20} color={Colors.error} />
                    <Text style={styles.logoutText}>Déconnexion</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.white,
        flex: 1,
    },
    content: {
        flex: 1,
        paddingTop: 20,
    },
    drawerItem: {
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderColor: 'rgba(0,0,0,0.06)',
        borderRadius: 14,
        borderWidth: 1,
        elevation: 3,
        flexDirection: 'row',
        marginBottom: 12,
        marginHorizontal: 16,
        paddingHorizontal: 16,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 5,
    },
    footer: {
        borderTopColor: Colors.lightMuted,
        borderTopWidth: 1,
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    header: {
        backgroundColor: Colors.primary,
        paddingBottom: 40,
        paddingHorizontal: 20,
        paddingTop: 20,
        position: 'relative',
    },
    itemIconContainer: {
        alignItems: 'center',
        backgroundColor: Colors.lightMuted,
        borderRadius: 20,
        height: 40,
        justifyContent: 'center',
        marginRight: 16,
        width: 40,
    },
    itemLabel: {
        ...TextStyles.h4Bold,
        color: Colors.primaryBorder,
        flex: 1,
        fontSize: FontSizes.medium,
    },
    logo: {
        borderRadius: 100,
        height: 80,
        marginRight: 16,
        width: 80,
    },
    logoutButton: {
        alignItems: 'center',
        flexDirection: 'row',
        paddingVertical: 12,
    },
    logoutText: {
        ...TextStyles.body,
        color: Colors.error,
        marginLeft: 12,
    },
    separator: {
        height: 25
    },
    userInfo: {
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: 20,
        paddingHorizontal: 10,
    },
    userName: {
        ...TextStyles.h2Bold,
        color: Colors.white,
        marginBottom: 2,
    },
    userRoom: {
        ...TextStyles.body,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '400',
    },
    userTextContainer: {
        alignItems: 'flex-start',
        flex: 1,
        justifyContent: 'center',
    },
});
