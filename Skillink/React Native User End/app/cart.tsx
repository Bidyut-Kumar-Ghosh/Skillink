import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/config/firebase';
import {
  addDoc,
  arrayRemove,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore/lite';
import { auth } from '@/config/firebase';

type CartCourse = {
  id: string;
  title: string;
  author: string;
  imageUrl?: string;
  price: number;
};

type PaymentMethod = 'online' | 'cod';

type ShippingAddress = {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export default function CartScreen() {
  const { user, loading: authStateLoading, authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [items, setItems] = useState<CartCourse[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('online');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successDetails, setSuccessDetails] = useState<{
    title: string;
    message: string;
    method: PaymentMethod;
  } | null>(null);
  const successOpacity = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0.92)).current;
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  const total = useMemo(() => items.reduce((sum, item) => sum + item.price, 0), [items]);

  const loadCart = async () => {
    if (!user?.id) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.id);
      const userSnapshot = await getDoc(userRef);
      if (!userSnapshot.exists()) {
        setItems([]);
        return;
      }

      const userData = userSnapshot.data() as any;
      const cartIds = Array.isArray(userData?.cartCourseIds)
        ? userData.cartCourseIds.filter((id: unknown): id is string => typeof id === 'string')
        : [];

      const savedAddress = userData?.shippingAddress;
      if (savedAddress && typeof savedAddress === 'object') {
        setShippingAddress((prev) => ({
          fullName: savedAddress.fullName || prev.fullName,
          phone: savedAddress.phone || prev.phone,
          street: savedAddress.street || prev.street,
          city: savedAddress.city || prev.city,
          state: savedAddress.state || prev.state,
          postalCode: savedAddress.postalCode || prev.postalCode,
          country: savedAddress.country || prev.country,
        }));
      }

      if (cartIds.length === 0) {
        setItems([]);
        return;
      }

      const courseSnapshots = await Promise.all(cartIds.map((courseId) => getDoc(doc(db, 'courses', courseId))));
      const cartItems = courseSnapshots
        .filter((snapshot) => snapshot.exists())
        .map((snapshot) => {
          const data = snapshot.data();
          return {
            id: snapshot.id,
            title: data.title || 'Untitled Course',
            author: data.author || data.instructor || 'Course Instructor',
            imageUrl: data.imageUrl || data.image || data.thumbnail,
            price: Number(data.price || 0),
          };
        });

      setItems(cartItems);
    } catch (error) {
      console.error('Failed to load cart:', error);
      Alert.alert('Error', 'Could not load cart items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authStateLoading) return;
    loadCart();
  }, [user?.id, authStateLoading]);

  useEffect(() => {
    if (!showSuccess) {
      successOpacity.setValue(0);
      successScale.setValue(0.92);
      return;
    }

    Animated.parallel([
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(successScale, {
        toValue: 1,
        friction: 8,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [showSuccess, successOpacity, successScale]);

  const updateAddressField = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }));
  };

  const validateShippingAddress = () => {
    const missingField = Object.entries(shippingAddress).find(([, value]) => value.trim() === '');
    if (missingField) {
      Alert.alert('Missing address', 'Please complete all address fields before checking out.');
      return false;
    }

    if (!/^\+?[0-9]{7,15}$/.test(shippingAddress.phone.trim())) {
      Alert.alert('Invalid phone number', 'Please enter a valid phone number.');
      return false;
    }

    return true;
  };

  const removeFromCart = async (courseId: string) => {
    if (!user?.id) return;

    setItems((prev) => prev.filter((item) => item.id !== courseId));
    try {
      const userRef = doc(db, 'users', user.id);
      const payload = { cartCourseIds: arrayRemove(courseId) };

      try {
        await updateDoc(userRef, payload);
      } catch {
        await setDoc(userRef, payload, { merge: true });
      }
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      Alert.alert('Error', 'Could not remove item from cart.');
      await loadCart();
    }
  };

  const handleCheckout = async () => {
    if (authLoading) {
      Alert.alert('Please wait', 'Checking your authentication status before checkout.');
      return;
    }

    const currentUid = auth.currentUser?.uid;
    if (!currentUid || items.length === 0) {
      Alert.alert('Sign in required', 'Please sign in to complete checkout.');
      return;
    }

    if (!validateShippingAddress()) {
      return;
    }

    setCheckoutLoading(true);
    try {
      const paymentStatus = 'pending';
      const orderStatus = paymentMethod === 'cod' ? 'placed' : 'processing';
      const paymentMethodValue = paymentMethod === 'cod' ? 'cash_on_delivery' : 'online';

      await Promise.all(
        items.map(async (item) => {
          await addDoc(collection(db, 'purchases'), {
            userId: currentUid,
            courseId: item.id,
            title: item.title,
            author: item.author,
            amount: item.price,
            paymentStatus,
            paymentMethod: paymentMethodValue,
            status: orderStatus,
            purchasedAt: new Date(),
            shippingAddress,
          });

          await addDoc(collection(db, 'enrollments'), {
            userId: user.id,
            courseId: item.id,
            enrollmentDate: new Date(),
            amount: item.price,
            status: orderStatus,
            paymentStatus,
            paymentMethod: paymentMethodValue,
            shippingAddress,
          });
        })
      );

      const userRef = doc(db, 'users', currentUid);
      try {
        await updateDoc(userRef, { cartCourseIds: [], shippingAddress });
      } catch {
        await setDoc(userRef, { cartCourseIds: [], shippingAddress }, { merge: true });
      }

      setItems([]);
      setSuccessDetails({
        title: paymentMethod === 'cod' ? 'Order placed' : 'Order received',
        message:
          paymentMethod === 'cod'
            ? 'Your cash on delivery order is confirmed and is being prepared for delivery.'
            : 'Your order is placed and waiting for payment confirmation. We will update you shortly.',
        method: paymentMethod,
      });
      setShowSuccess(true);
    } catch (error) {
      console.error('Checkout failed:', error);
      Alert.alert('Checkout failed', 'Could not complete checkout. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cart</Text>
        <View style={styles.headerRight} />
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#0F172A" />
          <Text style={styles.stateText}>Loading cart...</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.centerState}>
          <Ionicons name="cart-outline" size={58} color="#94A3B8" />
          <Text style={styles.stateTitle}>Your cart is empty</Text>
          <Text style={styles.stateText}>Add courses from the detail page to purchase them here.</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/')}>
            <Text style={styles.primaryBtnText}>Browse Courses</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.listContent}>
            <View style={styles.summaryCard}>
              <View>
                <Text style={styles.summaryEyebrow}>Secure checkout</Text>
                <Text style={styles.summaryTitle}>Ready to confirm your order?</Text>
                <Text style={styles.summaryText}>
                  {items.length} course{items.length === 1 ? '' : 's'} • Total {total.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryBadge}>
                <Ionicons name="shield-checkmark" size={18} color="#2563EB" />
              </View>
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Payment Method</Text>
              <View style={styles.paymentOptions}>
                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    paymentMethod === 'online' && styles.paymentOptionActive,
                  ]}
                  onPress={() => setPaymentMethod('online')}
                >
                  <View style={styles.paymentOptionHeader}>
                    <View style={styles.paymentIconWrap}>
                      <Ionicons name="card-outline" size={18} color={paymentMethod === 'online' ? '#2563EB' : '#475569'} />
                    </View>
                    <Text style={styles.paymentOptionLabel}>Pay Online</Text>
                  </View>
                  <Text style={styles.paymentOptionDescription}>
                    Complete payment instantly and unlock your courses right away.
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    paymentMethod === 'cod' && styles.paymentOptionActive,
                  ]}
                  onPress={() => setPaymentMethod('cod')}
                >
                  <View style={styles.paymentOptionHeader}>
                    <View style={styles.paymentIconWrap}>
                      <Ionicons name="cash-outline" size={18} color={paymentMethod === 'cod' ? '#0F172A' : '#475569'} />
                    </View>
                    <Text style={styles.paymentOptionLabel}>Cash on Delivery</Text>
                  </View>
                  <Text style={styles.paymentOptionDescription}>
                    Place the order now and pay when your package is confirmed.
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Shipping Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Full name"
                placeholderTextColor="#94A3B8"
                value={shippingAddress.fullName}
                onChangeText={(text) => updateAddressField('fullName', text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone number"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={shippingAddress.phone}
                onChangeText={(text) => updateAddressField('phone', text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Street address"
                placeholderTextColor="#94A3B8"
                value={shippingAddress.street}
                onChangeText={(text) => updateAddressField('street', text)}
              />
              <View style={styles.formRow}>
                <TextInput
                  style={[styles.input, styles.inputHalf]}
                  placeholder="City"
                  placeholderTextColor="#94A3B8"
                  value={shippingAddress.city}
                  onChangeText={(text) => updateAddressField('city', text)}
                />
                <TextInput
                  style={[styles.input, styles.inputHalf]}
                  placeholder="State"
                  placeholderTextColor="#94A3B8"
                  value={shippingAddress.state}
                  onChangeText={(text) => updateAddressField('state', text)}
                />
              </View>
              <View style={styles.formRow}>
                <TextInput
                  style={[styles.input, styles.inputHalf]}
                  placeholder="Postal code"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  value={shippingAddress.postalCode}
                  onChangeText={(text) => updateAddressField('postalCode', text)}
                />
                <TextInput
                  style={[styles.input, styles.inputHalf]}
                  placeholder="Country"
                  placeholderTextColor="#94A3B8"
                  value={shippingAddress.country}
                  onChangeText={(text) => updateAddressField('country', text)}
                />
              </View>

              <Text style={styles.shippingNote}>
                {paymentMethod === 'cod'
                  ? 'Cash on Delivery orders are subject to address verification and confirmation.'
                  : 'Your order will be reviewed and confirmed before we complete the payment step.'}
              </Text>
            </View>

            {items.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.thumbWrap}>
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.thumb} />
                  ) : (
                    <View style={styles.thumbPlaceholder}>
                      <Ionicons name="school-outline" size={24} color="#5B6BFF" />
                    </View>
                  )}
                </View>

                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.itemAuthor}>by {item.author}</Text>
                  <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                </View>

                <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeBtn}>
                  <Ionicons name="trash-outline" size={18} color="#DC2626" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <View style={styles.checkoutBar}>
            <View>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={[styles.checkoutBtn, checkoutLoading && styles.checkoutBtnDisabled]}
              onPress={handleCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.checkoutBtnText}>Checkout</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}

      {showSuccess && successDetails && (
        <Animated.View style={[styles.successOverlay, { opacity: successOpacity }] } pointerEvents="box-none">
          <Animated.View style={[styles.successCard, { transform: [{ scale: successScale }] }]}>
            <View style={styles.successIconWrap}>
              <Ionicons
                name="checkmark-circle"
                size={58}
                color={successDetails.method === 'cod' ? '#0F172A' : '#2563EB'}
              />
            </View>
            <Text style={styles.successTitle}>{successDetails.title}</Text>
            <Text style={styles.successMessage}>{successDetails.message}</Text>
            <View style={styles.successBadge}>
              <Text style={styles.successBadgeText}>
                {successDetails.method === 'cod' ? 'Cash on delivery' : 'Awaiting payment confirmation'}
              </Text>
            </View>
            <View style={styles.successActions}>
              <TouchableOpacity
                style={styles.successSecondaryBtn}
                onPress={() => {
                  setShowSuccess(false);
                  setSuccessDetails(null);
                  router.push('/');
                }}
              >
                <Text style={styles.successSecondaryText}>Continue shopping</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.successPrimaryBtn}
                onPress={() => {
                  setShowSuccess(false);
                  setSuccessDetails(null);
                  router.push('/profile/purchases');
                }}
              >
                <Text style={styles.successPrimaryText}>View orders</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerRight: {
    width: 38,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  stateTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 8,
  },
  stateText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 290,
  },
  primaryBtn: {
    marginTop: 18,
    backgroundColor: '#0F172A',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 130,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  thumbWrap: {
    width: 78,
    height: 78,
    borderRadius: 10,
    overflow: 'hidden',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  itemAuthor: {
    marginTop: 3,
    fontSize: 12,
    color: '#64748B',
  },
  itemPrice: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  removeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  summaryTitle: {
    marginTop: 4,
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  summaryText: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748B',
  },
  summaryBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  paymentOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  paymentOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#FFFFFF',
  },
  paymentOptionActive: {
    borderColor: '#2563EB',
    backgroundColor: '#F8FAFC',
  },
  paymentOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
  },
  paymentOptionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  paymentOptionDescription: {
    marginTop: 6,
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#0F172A',
    fontSize: 14,
    marginBottom: 12,
  },
  inputHalf: {
    flex: 1,
  },
  shippingNote: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
  },
  checkoutBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  totalValue: {
    marginTop: 2,
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  checkoutBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  checkoutBtnDisabled: {
    opacity: 0.7,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.58)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  successCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  successIconWrap: {
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  successBadge: {
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#EFF6FF',
  },
  successBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  successActions: {
    marginTop: 18,
    width: '100%',
    flexDirection: 'row',
    gap: 10,
  },
  successSecondaryBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    alignItems: 'center',
  },
  successSecondaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  successPrimaryBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  successPrimaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
