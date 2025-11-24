class UserRepository {
  static final List<Map<String, String>> _users = [];

  static void register(String name, String email, String password) {
    _users.add({
      "name": name,
      "email": email,
      "password": password,
    });
  }

  static bool login(String email, String password) {
    return _users.any((u) => u["email"] == email && u["password"] == password);
  }
}
