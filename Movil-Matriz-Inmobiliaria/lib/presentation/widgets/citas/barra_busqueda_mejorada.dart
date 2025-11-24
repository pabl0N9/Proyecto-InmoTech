import 'package:flutter/material.dart';

class BarraBusquedaMejorada extends StatefulWidget {
  final TextEditingController controller;
  final Function(String) onChanged;
  final Function(String) onSubmitted;
  final VoidCallback onClear;
  final String hintText;
  final bool showSuggestions;
  final List<String>? suggestions;

  const BarraBusquedaMejorada({
    super.key,
    required this.controller,
    required this.onChanged,
    required this.onSubmitted,
    required this.onClear,
    this.hintText = 'Buscar citas...',
    this.showSuggestions = true,
    this.suggestions,
  });

  @override
  State<BarraBusquedaMejorada> createState() => _BarraBusquedaMejoradaState();
}

class _BarraBusquedaMejoradaState extends State<BarraBusquedaMejorada>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;
  bool _isSearching = false;
  bool _showSuggestions = false;
  final FocusNode _focusNode = FocusNode();

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    );

    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 1.02,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));

    _focusNode.addListener(() {
      setState(() {
        _showSuggestions = _focusNode.hasFocus && widget.showSuggestions;
      });
    });

    widget.controller.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    _animationController.dispose();
    _focusNode.dispose();
    widget.controller.removeListener(_onSearchChanged);
    super.dispose();
  }

  void _onSearchChanged() {
    final hasText = widget.controller.text.isNotEmpty;
    if (hasText != _isSearching) {
      setState(() {
        _isSearching = hasText;
      });
      if (hasText) {
        _animationController.forward();
      } else {
        _animationController.reverse();
      }
    }
    widget.onChanged(widget.controller.text);
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _scaleAnimation,
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value,
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
              border: Border.all(
                color: _isSearching
                    ? const Color(0xFF0A4B84).withOpacity(0.3)
                    : Colors.grey.shade200,
                width: _isSearching ? 2 : 1,
              ),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildSearchField(),
                if (_showSuggestions && widget.suggestions != null)
                  _buildSuggestions(),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildSearchField() {
    return TextField(
      controller: widget.controller,
      focusNode: _focusNode,
      onSubmitted: widget.onSubmitted,
      decoration: InputDecoration(
        hintText: widget.hintText,
        hintStyle: TextStyle(
          color: Colors.grey.shade500,
          fontSize: 16,
        ),
        prefixIcon: AnimatedSwitcher(
          duration: const Duration(milliseconds: 200),
          child: _isSearching
              ? IconButton(
                  key: const ValueKey('search'),
                  icon: const Icon(Icons.search, color: Color(0xFF0A4B84)),
                  onPressed: () {},
                )
              : const Icon(
                  Icons.search,
                  color: Colors.grey,
                  key: ValueKey('search_idle'),
                ),
        ),
        suffixIcon: AnimatedSwitcher(
          duration: const Duration(milliseconds: 200),
          child: _isSearching
              ? IconButton(
                  key: const ValueKey('clear'),
                  icon: const Icon(Icons.clear, color: Colors.grey),
                  onPressed: () {
                    widget.controller.clear();
                    widget.onClear();
                  },
                )
              : const SizedBox.shrink(key: ValueKey('empty')),
        ),
        border: InputBorder.none,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      ),
      style: const TextStyle(
        fontSize: 16,
        color: Colors.black87,
      ),
    );
  }

  Widget _buildSuggestions() {
    if (widget.suggestions == null || widget.suggestions!.isEmpty) {
      return const SizedBox.shrink();
    }

    final filteredSuggestions = widget.suggestions!
        .where((suggestion) =>
            suggestion.toLowerCase().contains(widget.controller.text.toLowerCase()))
        .take(5)
        .toList();

    if (filteredSuggestions.isEmpty) {
      return const SizedBox.shrink();
    }

    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      constraints: const BoxConstraints(maxHeight: 200),
      curve: Curves.easeOut,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.vertical(bottom: Radius.circular(16)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ListView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: filteredSuggestions.length,
        itemBuilder: (context, index) {
          final suggestion = filteredSuggestions[index];
          return _buildSuggestionItem(suggestion, index);
        },
      ),
    );
  }

  Widget _buildSuggestionItem(String suggestion, int index) {
    final query = widget.controller.text.toLowerCase();
    final matches = _getMatches(suggestion, query);

    return InkWell(
      onTap: () {
        widget.controller.text = suggestion;
        widget.onSubmitted(suggestion);
        _focusNode.unfocus();
        setState(() {
          _showSuggestions = false;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            const Icon(
              Icons.history,
              size: 20,
              color: Colors.grey,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildHighlightedText(suggestion, matches),
            ),
            const Icon(
              Icons.arrow_forward_ios,
              size: 16,
              color: Colors.grey,
            ),
          ],
        ),
      ),
    );
  }

  List<int> _getMatches(String text, String query) {
    final matches = <int>[];
    final textLower = text.toLowerCase();
    final queryLower = query.toLowerCase();

    int start = 0;
    while (true) {
      final index = textLower.indexOf(queryLower, start);
      if (index == -1) break;
      matches.add(index);
      start = index + query.length;
    }

    return matches;
  }

  Widget _buildHighlightedText(String text, List<int> matches) {
    if (matches.isEmpty || widget.controller.text.isEmpty) {
      return Text(
        text,
        style: const TextStyle(
          fontSize: 16,
          color: Colors.black87,
        ),
      );
    }

    final spans = <TextSpan>[];
    int lastIndex = 0;

    for (final match in matches) {
      // Add text before match
      if (match > lastIndex) {
        spans.add(TextSpan(
          text: text.substring(lastIndex, match),
          style: const TextStyle(
            fontSize: 16,
            color: Colors.black87,
          ),
        ));
      }

      // Add highlighted match
      spans.add(TextSpan(
        text: text.substring(match, match + widget.controller.text.length),
        style: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.bold,
          color: const Color(0xFF0A4B84),
          backgroundColor: const Color(0xFF0A4B84).withOpacity(0.1),
        ),
      ));

      lastIndex = match + widget.controller.text.length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      spans.add(TextSpan(
        text: text.substring(lastIndex),
        style: const TextStyle(
          fontSize: 16,
          color: Colors.black87,
        ),
      ));
    }

    return RichText(
      text: TextSpan(children: spans),
    );
  }
}
