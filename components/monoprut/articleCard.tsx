import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Colors, TextStyles } from '@/constants/GraphSettings';
import { Apple, CupSoda, Candy, Sandwich, Milk, Croissant, Drumstick, Carrot, Fish, Wheat, Package, Trash2 } from 'lucide-react-native';
import { apiPost, apiDelete } from '@/constants/api/apiCalls';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';

interface Article {
    id: number;
    product: string;
    quantity: string;
    type: 'fruit' | 'veggie' | 'drink' | 'sweet' | 'snack' | 'dairy' | 'bread' | 'meat' | 'fish' | 'grain' | 'other';
    giver_room_id: number;
    receiver_room_id: number | null;
    giver_room?: {
        roomNumber: string;
        name: string;
    };
    receiver_room?: {
        roomNumber: string;
        name: string;
        id: number;
    };
    giver_info?: {
        responsible_name: string;
        room: string;
    };
    receiver_info?: {
        responsible_name: string;
        room: string;
    };
}

interface ArticleCardProps {
    article: Article;
    onUpdate: () => void;
    showReserveButton?: boolean;
    isReservation?: boolean;
    isMyOffer?: boolean;
    onMarkAsRetrieved?: (articleId: number) => void;
    onCancelReservation?: (articleId: number) => void;
}

const getIconForType = (type: string) => {
    const iconProps = { size: 24, color: Colors.primary };
    switch (type) {
        case 'fruit':
            return <Apple {...iconProps} />;
        case 'drink':
            return <CupSoda {...iconProps} />;
        case 'sweet':
            return <Candy {...iconProps} />;
        case 'snack':
            return <Sandwich {...iconProps} />;
        case 'dairy':
            return <Milk {...iconProps} />;
        case 'bread':
            return <Croissant {...iconProps} />;
        case 'meat':
            return <Drumstick {...iconProps} />;
        case 'veggie':
            return <Carrot {...iconProps} />;
        case 'fish':
            return <Fish {...iconProps} />;
        case 'grain':
            return <Wheat {...iconProps} />;
        default:
            return <Package {...iconProps} />;
    }
};

const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
        fruit: 'Fruit',
        veggie: 'Légume',
        drink: 'Boisson',
        sweet: 'Sucrerie',
        snack: 'Snack',
        dairy: 'Produit laitier',
        bread: 'Pain',
        meat: 'Viande',
        fish: 'Poisson',
        grain: 'Céréale',
        other: 'Autre',
    };
    return labels[type] || 'Autre';
};

export default function ArticleCard({ article, onUpdate, showReserveButton = false, isReservation = false, isMyOffer = false, onMarkAsRetrieved, onCancelReservation }: ArticleCardProps) {
    const navigation = useNavigation<any>();

    const handleReserve = async () => {
        Alert.alert(
            'Réserver cet article',
            `Voulez-vous vraiment réserver "${article.product}" ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Réserver',
                    onPress: async () => {
                        try {
                            const response = await apiPost(`articles/${article.id}/shotgun`, {});
                            if (response.success) {
                                Toast.show({
                                    type: 'success',
                                    text1: 'Réservation confirmée',
                                    text2: 'L\'article a été réservé avec succès.',
                                });
                                onUpdate();
                            } else {
                                Toast.show({
                                    type: 'error',
                                    text1: 'Erreur',
                                    text2: response.message || 'Impossible de réserver l\'article.',
                                });
                            }
                        } catch (error: any) {
                            Toast.show({
                                type: 'error',
                                text1: 'Erreur',
                                text2: error.message || 'Une erreur est survenue.',
                            });
                        }
                    },
                },
            ]
        );
    };

    const handleDelete = async () => {
        Alert.alert(
            'Supprimer l\'article',
            `Voulez-vous vraiment supprimer "${article.product}" ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await apiDelete(`articles/${article.id}`);
                            if (response.success) {
                                Toast.show({
                                    type: 'success',
                                    text1: 'Article supprimé',
                                    text2: 'L\'article a été supprimé avec succès.',
                                });
                                onUpdate();
                            } else {
                                Toast.show({
                                    type: 'error',
                                    text1: 'Erreur',
                                    text2: response.message || 'Impossible de supprimer l\'article.',
                                });
                            }
                        } catch (error: any) {
                            Toast.show({
                                type: 'error',
                                text1: 'Erreur',
                                text2: error.message || 'Une erreur est survenue.',
                            });
                        }
                    },
                },
            ]
        );
    };

    const handleRoomClick = () => {
        if (article.receiver_room) {
            navigation.navigate('RoomDetailsScreen', { roomId: article.receiver_room.id });
        }
    };

    return (
        <View style={styles.card}>
            {!isMyOffer && !isReservation && (
                <View style={styles.iconContainer}>
                    {getIconForType(article.type)}
                </View>
            )}

            <View style={styles.content}>
                {!isMyOffer && !isReservation && (
                    <View style={styles.header}>
                        <Text style={styles.productName}>{article.product}</Text>
                    </View>
                )}

                {(isMyOffer || isReservation) && (
                    <View style={styles.header}>
                        <Text style={styles.productName}>{article.quantity} {article.product}</Text>
                    </View>
                )}

                {!isMyOffer && !isReservation && (
                    <Text style={styles.quantity}>Quantité : {article.quantity}</Text>
                )}

                {isReservation && (
                    <View style={styles.roomInfo}>
                        <Text style={styles.roomLabel}>À récupérer auprès de :</Text>
                        <Text style={styles.roomName}>
                            {article.giver_info
                                ? `Chambre ${article.giver_info.room}\n(Resp : ${article.giver_info.responsible_name})`
                                : `Chambre ${article.giver_room_id}`
                            }
                        </Text>
                    </View>
                )}

                {/* {!isReservation && !isMyOffer && (
                    <View style={styles.roomInfo}>
                        <Text style={styles.roomLabel}>Chambre :</Text>
                        <Text style={styles.roomName}>
                            {article.giver_room
                                ? `${article.giver_room.roomNumber} - ${article.giver_room.name}`
                                : `Chambre ${article.giver_room_id}`
                            }
                        </Text>
                    </View>
                )} */}

                {isMyOffer && article.receiver_room_id && (
                    <View style={styles.roomInfo}>
                        <Text style={styles.roomLabel}>Réservé par :</Text>
                        <Text style={styles.roomName}>
                            {article.receiver_info
                                ? `Chambre ${article.receiver_info.room}\n(Resp : ${article.receiver_info.responsible_name})`
                                : `Chambre ${article.receiver_room_id}`
                            }
                        </Text>
                    </View>
                )}

                {isMyOffer && !article.receiver_room_id && (
                    <View style={styles.roomInfo}>
                        <Text style={styles.roomLabel}>Pas de grand succès pour l'instant ...</Text>
                    </View>
                )}
            </View>

            {showReserveButton && (
                <TouchableOpacity style={styles.reserveButton} onPress={handleReserve} activeOpacity={0.7}>
                    <Text style={styles.reserveButtonText}>Réserver</Text>
                </TouchableOpacity>
            )}

            {isMyOffer && !article.receiver_room_id && (
                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} activeOpacity={0.7}>
                    <Trash2 size={20} color={Colors.error} />
                </TouchableOpacity>
            )}

            {isReservation && (
                <View style={styles.actionButtons}>
                    {onMarkAsRetrieved && (
                        <TouchableOpacity
                            style={styles.retrievedButton}
                            onPress={() => {
                                Alert.alert(
                                    'Confirmer la récupération',
                                    `Avez-vous bien récupéré "${article.product}" ?`,
                                    [
                                        { text: 'Non', style: 'cancel' },
                                        {
                                            text: 'Oui',
                                            onPress: () => onMarkAsRetrieved(article.id),
                                        },
                                    ]
                                );
                            }}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.retrievedButtonText}>Récupéré</Text>
                        </TouchableOpacity>
                    )}
                    {onCancelReservation && (
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => {
                                Alert.alert(
                                    'Annuler la réservation',
                                    `Voulez-vous vraiment annuler la réservation de "${article.product}" ?`,
                                    [
                                        { text: 'Non', style: 'cancel' },
                                        {
                                            text: 'Oui',
                                            style: 'destructive',
                                            onPress: () => onCancelReservation(article.id),
                                        },
                                    ]
                                );
                            }}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.cancelButtonText}>Annuler</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.lightMuted,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: `${Colors.primary}10`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'column',
        marginBottom: 6,
    },
    productName: {
        ...TextStyles.h4Bold,
        color: Colors.primaryBorder,
        marginBottom: 4,
    },
    typeBadge: {
        backgroundColor: Colors.lightMuted,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    typeBadgeText: {
        ...TextStyles.small,
        color: Colors.primaryBorder,
        fontSize: 10,
    },
    quantity: {
        ...TextStyles.body,
        color: Colors.muted,
    },
    roomInfo: {
        marginTop: 4,
    },
    roomLabel: {
        ...TextStyles.body,
        color: Colors.muted,
        marginBottom: 2,
    },
    roomName: {
        ...TextStyles.body,
        color: Colors.primaryBorder,
    },
    availableText: {
        ...TextStyles.body,
        color: Colors.primary,
        fontWeight: '600',
    },
    reserveButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginLeft: 12,
    },
    reserveButtonText: {
        ...TextStyles.bodyBold,
        color: Colors.white,
    },
    deleteButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: `${Colors.error}10`,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    retrievedButton: {
        backgroundColor: Colors.success,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    retrievedButtonText: {
        ...TextStyles.bodyBold,
        fontSize: 13,
        color: Colors.white,
    },
    actionButtons: {
        flexDirection: 'column',
        gap: 8,
        marginLeft: 12,
    },
    cancelButton: {
        backgroundColor: Colors.error,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        ...TextStyles.bodyBold,
        fontSize: 14,
        color: Colors.white,
    },
});

