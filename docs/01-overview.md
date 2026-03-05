# Overview

## What is TravelMate?
TravelMate는 외국인 여행자(TRAVELER)가 한국에서 여행 정보를 얻고,
한국인 로컬(LOCAL)과 연결되어 온라인/오프라인 가이드를 받을 수 있는 매칭 서비스 MVP입니다.

## Problem
- 외국인 여행자는 한국 현지 정보(맛집/코스/동선/주의사항)를 얻기 어렵습니다.
- 정적인 블로그/후기 위주의 정보는 개인화가 어렵고 최신성이 떨어집니다.
- 여행 중 즉시 질문/피드백/조율할 커뮤니케이션 수단이 필요합니다.

## Solution
- 여행자가 여행 요청(Request)을 작성하면 로컬이 Like/Accept 과정을 통해 매칭됩니다.
- 매칭이 성사되면 Chat이 생성되고, 실시간(Socket.IO) 채팅으로 즉시 소통합니다.
- 메시지/타이핑/읽음처리(Seen)를 지원하여 실제 서비스 수준의 UX를 목표로 합니다.

## User Types
- TRAVELER: 여행 요청 생성, 로컬 매칭, 채팅
- LOCAL: 여행 요청 탐색, Like, 매칭 후 채팅

## Core User Flow
1. TRAVELER 회원가입/로그인
2. 여행 요청(Request) 생성
3. LOCAL이 요청을 Like
4. TRAVELER가 Accept → Match 생성
5. Match 기반으로 Chat 생성
6. Chat에서 실시간 메시지/타이핑/읽음 처리

## Scope (MVP)
- JWT 인증 (access/refresh)
- Request / Match / Chat 기능
- Realtime chat: joinChat, sendMessage, typing, seen
- Inbox: 내 채팅방 리스트 + 마지막 메시지 + unreadCount
