import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";

const LogoutDialog = ({ visible, onClose, onConfirm }) => {
  const { isDarkMode } = useTheme();

  if (Platform.OS !== "web") return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: isDarkMode ? "#1E1E1E" : "#FFFFFF",
              borderColor: isDarkMode ? "#2D2D2D" : "#E0E0E0",
            },
          ]}
        >
          <Text
            style={[
              styles.modalTitle,
              { color: isDarkMode ? "#FFFFFF" : "#333333" },
            ]}
          >
            Logout Confirmation
          </Text>
          <Text
            style={[
              styles.modalMessage,
              { color: isDarkMode ? "#8F96AB" : "#666666" },
            ]}
          >
            Are you sure you want to logout?
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.logoutButton]}
              onPress={onConfirm}
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxWidth: 400,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    fontFamily: "Inter-SemiBold",
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 24,
    fontFamily: "Inter-Regular",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
  },
  cancelButtonText: {
    color: "#666666",
    fontSize: 16,
    fontFamily: "Inter-Medium",
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter-Medium",
  },
});

export default LogoutDialog;
