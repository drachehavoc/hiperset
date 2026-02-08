#!/bin/bash

__PS1__() {
  local __ps1_truecolor__ 
  local __ps1_basic__
  local _reset=$'\e[0m' _separator=$'\uE0B0' _italic=$'\e[3m' _bold=$'\e[1m'

  # Truecolor PS1
  # Uses 24-bit RGB colors for the prompt segments. Each segment has a 
  # foreground color and a background color, creating a smooth transition 
  # between segments. The colors are defined using RGB values, allowing for a 
  # wide range of colors and gradients.

  ___ps1_truecolor__() {
    
    local _reds=() _greens=() _blues=() _texts=()
    local _fn_color_apply _fn_add_segment _fn_compose_segments

    _fn_color_apply() {
      local type=$1 index=$2 type_code=38 
      local r=${_reds[index]} g=${_greens[index]} b=${_blues[index]}
      [[ "$type" == "bg" ]] && type_code=48
      printf '\e[%s;2;%s;%s;%sm' "$type_code" "$r" "$g" "$b"
    }
    
    _fn_add_segment() {
      _reds+=($1) _greens+=($2) _blues+=($3)
      shift 3 
      _texts+=("$*")
    }

    _fn_compose_segments() {
      local i result=""
      for i in "${!_texts[@]}"; do
        local nxt_color=$(_fn_color_apply bg $((i+1)))
        local sep_color=$(_fn_color_apply fg $i)$nxt_color
        local txt="$(_fn_color_apply bg $i)${_texts[i]}"
        result+="${_italic}${txt}${_reset}${sep_color}${_separator}${_reset}"
      done
      printf "%s" "$result"
    }

    #
    # Define the segments for the truecolor PS1
    #
    
    # _fn_add_segment  22 160 133 " \A "
    # _fn_add_segment  46 204 113 " \u "
    # _fn_add_segment  52 152 219 " \w "
    _fn_add_segment 155  89 182 " \t "
    _fn_add_segment  52  73  94 " \u "
    _fn_add_segment 243 156  18 " \w "
    # _fn_add_segment 230 126  34 " \w "
    # _fn_add_segment 231  76  60 " \w "

    # Set the PS1 for the truecolor prompt
    export PS1="$(_fn_compose_segments)\n$ "
  }


  # Basic PS1
  # Uses standard ANSI color codes for the prompt segments. Each segment has a 
  # foreground color and a background color defined by adding 10 to the 
  # foreground color code. The colors are limited to the standard 8 or 16 
  # colors, but this approach is widely supported across different terminal 
  # emulators.

  __ps1_basic__() {
    local _colors=() _texts=()
    local _fn_add_segment _fn_compose_segments

    _fn_add_segment() {
      _colors+=($1)
      shift 1
      _texts+=("$*")
    }

    _fn_compose_segments() {
      local i result=""
      for i in "${!_texts[@]}"; do
        local txt="${_texts[i]}"
        local color="\[\e[$((_colors[i] + 10))m\]"
        local nxt_color="\[\e[${_colors[i]};$((_colors[$((i+1))] + 10))m\]"
        result+="${color}${txt}${_reset}${nxt_color}${_separator}${_reset}"
      done
      printf "%s" "$result"
    }

    #
    # Define the segments for the basic PS1
    #

    _fn_add_segment 33 " \A "
    _fn_add_segment 36 " \u "
    _fn_add_segment 35 " \w "

    # Set the PS1 for the basic prompt
    export PS1="$(_fn_compose_segments)\n$ "
  }

  #
  # Determine which PS1 to use based on COLORTERM
  #

  if [[ "$COLORTERM" == *"truecolor"* ]]; then
    ___ps1_truecolor__
  else
    __ps1_basic__
  fi
}

__PS1__