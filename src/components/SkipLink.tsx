/**
 * SnapMeal AI - Skip link component for accessibility
 * Copyright (C) 2025 Team11-Project2
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

export default function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only rounded bg-black px-3 py-2 text-white focus:not-sr-only focus:absolute focus:top-2 focus:left-2"
    >
      Skip to content
    </a>
  );
}
