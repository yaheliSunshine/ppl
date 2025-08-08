/*
 * **********************************************
 * Printing result depth
 *
 * You can enlarge it, if needed.
 * **********************************************
 */
maximum_printing_depth(100).

:- current_prolog_flag(toplevel_print_options, A),
   (select(max_depth(_), A, B), ! ; A = B),
   maximum_printing_depth(MPD),
   set_prolog_flag(toplevel_print_options, [max_depth(MPD)|B]).
% Additional methods
del([],_,[]).
del([X|Xs],Z,[X|Ys]) :- X \= Z,
                           del(Xs,Z,Ys).
del([X|Xs],X,Ys) :- del(Xs,X,Ys).

included(X, [X | _Xs]).
included(X, [ _Y | Ys]) :- included(X, Ys). 

not_included(_X, []).
not_included(X, [Y | Ys]) :- X \= Y, not_included(X, Ys). 

% Signature: unique(List, UniqueList, Dups)/3
% Purpose: succeeds if and only if UniqueList contains the same elements of List without duplicates (according to their order in List), and Dups contains the duplicates
unique([], [], []).
unique([X], [X], []).
unique([X | Xs], [X | Ys], [X | Zs]) :- del(Xs, X, Ws), unique(Ws, Ys, Zs), included(X, Xs).
unique([X | Xs], [X | Ys], Zs) :- del(Xs, X, Ws), unique(Ws, Ys, Zs), not_included(X, Xs).
