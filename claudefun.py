#!/usr/bin/env python3
"""
ClaudeFun - A fun CLI tool to brighten your day!
"""

import argparse
import random
import sys
from datetime import datetime


# Joke collections
PROGRAMMING_JOKES = [
    "Why do programmers prefer dark mode? Because light attracts bugs!",
    "Why do Java developers wear glasses? Because they don't C#!",
    "How many programmers does it take to change a light bulb? None, that's a hardware problem.",
    "Why did the programmer quit his job? Because he didn't get arrays!",
    "What's a programmer's favorite hangout place? Foo Bar!",
    "Why do programmers always mix up Halloween and Christmas? Because Oct 31 == Dec 25!",
    "A SQL query walks into a bar, walks up to two tables and asks... 'Can I join you?'",
    "What do you call a programmer from Finland? Nerdic!",
]

DAD_JOKES = [
    "I'm afraid for the calendar. Its days are numbered.",
    "What do you call a fake noodle? An impasta!",
    "Did you hear about the claustrophobic astronaut? He just needed a little space.",
    "Why don't scientists trust atoms? Because they make up everything!",
    "I only know 25 letters of the alphabet. I don't know y.",
    "What did the ocean say to the beach? Nothing, it just waved.",
    "Why can't a bicycle stand on its own? It's two tired!",
]

# Fortune messages
FORTUNES = [
    "A great adventure awaits you in the near future.",
    "Your code will compile on the first try today!",
    "An unexpected pull request approval is coming your way.",
    "The bug you've been hunting will reveal itself tomorrow.",
    "You will soon discover a forgotten TODO comment that changes everything.",
    "A merge conflict approaches, but you will resolve it with grace.",
    "Your next commit message will be both clear and witty.",
    "You will soon help a colleague solve a difficult problem.",
    "A new framework will catch your interest this week.",
    "Your debugging skills will be put to the test, and you will prevail!",
    "Good fortune smiles upon your next deployment.",
    "You will soon learn something that makes you a better developer.",
]

# Lucky number ranges
LOTTERY_NUMBERS = (1, 69)
MEGA_NUMBER = (1, 26)


def get_joke(joke_type=None):
    """Get a random joke."""
    if joke_type == "programming" or joke_type == "prog":
        jokes = PROGRAMMING_JOKES
    elif joke_type == "dad":
        jokes = DAD_JOKES
    else:
        jokes = PROGRAMMING_JOKES + DAD_JOKES

    return random.choice(jokes)


def get_fortune():
    """Get a random fortune."""
    return random.choice(FORTUNES)


def generate_lucky_numbers(count=6):
    """Generate lucky lottery numbers."""
    main_numbers = random.sample(range(*LOTTERY_NUMBERS), count)
    mega_number = random.randint(*MEGA_NUMBER)
    main_numbers.sort()
    return main_numbers, mega_number


def print_banner(text):
    """Print a nice banner."""
    width = len(text) + 4
    print("=" * width)
    print(f"  {text}  ")
    print("=" * width)


def cmd_joke(args):
    """Handle joke command."""
    print_banner("😄 JOKE TIME")
    joke = get_joke(args.type)
    print(f"\n{joke}\n")


def cmd_fortune(args):
    """Handle fortune command."""
    print_banner("🔮 YOUR FORTUNE")
    fortune = get_fortune()
    print(f"\n{fortune}\n")


def cmd_lucky(args):
    """Handle lucky numbers command."""
    print_banner("🎲 LUCKY NUMBERS")
    main_numbers, mega_number = generate_lucky_numbers(args.count)
    print(f"\nYour lucky numbers: {' - '.join(map(str, main_numbers))}")
    print(f"Mega number: {mega_number}\n")
    print("Good luck! 🍀\n")


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="ClaudeFun - A fun CLI tool to brighten your day!",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s joke              Get a random joke
  %(prog)s joke --type dad   Get a dad joke
  %(prog)s joke --type prog  Get a programming joke
  %(prog)s fortune           Get your fortune
  %(prog)s lucky             Generate lucky numbers
        """
    )

    subparsers = parser.add_subparsers(dest='command', help='Available commands')

    # Joke command
    joke_parser = subparsers.add_parser('joke', help='Get a random joke')
    joke_parser.add_argument(
        '--type', '-t',
        choices=['programming', 'prog', 'dad', 'all'],
        default='all',
        help='Type of joke (default: all)'
    )
    joke_parser.set_defaults(func=cmd_joke)

    # Fortune command
    fortune_parser = subparsers.add_parser('fortune', help='Get your fortune')
    fortune_parser.set_defaults(func=cmd_fortune)

    # Lucky numbers command
    lucky_parser = subparsers.add_parser('lucky', help='Generate lucky numbers')
    lucky_parser.add_argument(
        '--count', '-c',
        type=int,
        default=6,
        help='Number of lucky numbers to generate (default: 6)'
    )
    lucky_parser.set_defaults(func=cmd_lucky)

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return 1

    # Execute the command
    args.func(args)
    return 0


if __name__ == '__main__':
    sys.exit(main())
