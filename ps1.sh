#!/bin/bash

set_prompt() {
  local reset="\[\e[0m\]"
  local separator=""

  function wrt() {
    # parameter
    local fg_color_number="$1"
    local text="$2"
    local next_color_number="$(($3 + 10))"
    # compute background color number
    local bg_color_number="$((fg_color_number + 10))"
    local color="\[\e[${fg_color_number};${bg_color_number}m\]"
    local color_end="\e[${fg_color_number};${next_color_number}m"
    # print
    echo -n "${color}${text}${reset}${color_end}${separator}"
  }

  dir=$(wrt 32 "\w " 30)
  usr=$(wrt 30 " \u " 0)
  export PS1="${dir}${usr}\n${reset}$ "
}

set_prompt