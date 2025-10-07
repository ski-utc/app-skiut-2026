import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Image } from 'react-native';
import { Colors, TextStyles, FontSizes, Fonts } from '@/constants/GraphSettings';
import {
    User,
    MapPin,
    Bus,
    Map,
    Mountain,
    X,
    Phone,
    Zap,
    Settings,
    LogOut,
    ChevronRight,
    PhoneCall,
    Gauge,
    Heart,
    UserRoundCheck
} from 'lucide-react-native';
import { useUser } from '@/contexts/UserContext';
import { DrawerContentScrollView } from '@react-navigation/drawer';

interface CustomDrawerProps {
    navigation: any;
    state: any;
    descriptors: any;
}

export default function CustomDrawer({ navigation }: CustomDrawerProps) {
    const { user, setUser } = useUser();

    const handleLogout = () => {
        setUser(null);
        navigation.closeDrawer();
    };

    const navigateToScreen = (screenName: string) => {
        navigation.closeDrawer();

        setTimeout(() => {
            navigation.navigate('MainTabs', {
                screen: 'profilNavigator',
                params: {
                    screen: screenName
                }
            });
        }, 100);
    };

    const drawerItems = [
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
            label: 'Vitesse de glisse',
            icon: Gauge,
            onPress: () => navigateToScreen('VitesseDeGlisseScreen')
        },
        {
            label: 'Skinder',
            icon: Heart,
            onPress: () => navigateToScreen('SkinderNavigator')
        },
        {
            label: 'Navettes',
            icon: Bus,
            onPress: () => navigateToScreen('NavettesScreen')
        }
    ];

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
                        source={require('../../assets/images/logo.png')}
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
                    >
                        <View style={styles.itemIconContainer}>
                            <item.icon size={20} color={Colors.primary} />
                        </View>
                        <Text style={styles.itemLabel}>{item.label}</Text>
                        <ChevronRight size={20} color={Colors.primaryBorder} />
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <LogOut size={20} color={Colors.error} />
                    <Text style={styles.logoutText}>Déconnexion</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    header: {
        backgroundColor: Colors.primary,
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: 20,
        position: 'relative',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        paddingHorizontal: 10,
    },
    logo: {
        width: 80,
        height: 80,
        marginRight: 16,
        borderRadius: 100,
    },
    userTextContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    userName: {
        ...TextStyles.h2,
        fontWeight: '600',
        color: Colors.white,
        marginBottom: 2,
    },
    userRoom: {
        ...TextStyles.body,
        fontWeight: '400',
        color: 'rgba(255, 255, 255, 0.8)',
    },
    content: {
        flex: 1,
        paddingTop: 20,
    },
    drawerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: Colors.white,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.06)',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 2, height: 3 },
        shadowRadius: 5,
        elevation: 3,
    },
    itemIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.lightMuted,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    itemLabel: {
        ...TextStyles.body,
        color: Colors.primaryBorder,
        fontWeight: '600',
        flex: 1,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: Colors.lightMuted,
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    logoutText: {
        ...TextStyles.body,
        color: Colors.error,
        marginLeft: 12,
    },
});
